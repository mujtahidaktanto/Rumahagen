-- 0146_close_rpc_anon_and_audit_forgery_gaps.sql
-- Menutup celah yang dibuktikan di DB live (2026-09-25, transaksi rollback sebagai role anon/authenticated) lewat audit advisor Supabase.
-- Kunci anon bersifat publik, sehingga fungsi yang EXECUTE-able anon bisa dipanggil siapa pun lewat /rest/v1/rpc:
--   1. create_notification: guard "auth.uid() IS NOT NULL AND NOT admin" terlewati saat uid NULL (anon) -> anon bisa membuat notifikasi ke user mana pun
--      (spam/phishing).
--   2. log_audit_event: tanpa guard sama sekali -> anon dan agen biasa bisa menulis baris audit_logs palsu (tabel bukti audit).
--   3. check_and_increment_rate_limit: tanpa guard -> anon bisa menaikkan hitungan key rate limit milik pengguna lain (DoS terarah).
--
-- Model setelah migration ini:
--   * check_and_increment_rate_limit: hanya service_role (kode aplikasi memanggilnya lewat client service role).
--   * log_audit_event (uid dari sesi): tidak lagi bisa dipanggil anon/authenticated lewat RPC. Fungsi SECURITY DEFINER lain di database tetap memanggilnya
--     (berjalan sebagai pemilik). Untuk route API ditambahkan log_audit_event_for(p_user_id, ...) yang hanya service_role: pengguna tidak bisa lagi
--     memalsukan audit, dan user_id ditentukan server.
--   * create_notification: hanya Superadmin/Admin yang login atau service_role (anon ditolak); EXECUTE anon dicabut.
--   * Pertahanan berlapis: EXECUTE anon dicabut dari fungsi-fungsi RPC yang sudah punya guard tetapi tak punya alasan dipanggil anon; EXECUTE anon dan
--     authenticated dicabut dari semua fungsi trigger (izin EXECUTE hanya diperiksa saat CREATE TRIGGER, bukan saat trigger berjalan).
--   * search_path dikunci pada 12 fungsi yang disebut advisor.
-- Tidak diubah (disengaja): fungsi pembantu RLS (has_permission, auth_scope, is_*), get_shared_dbr_simulation (tautan publik berbasis token), course_enroll_problem
-- (dipanggil trigger invoker).

-- ═══ 1. Rate limit: hanya service_role ═══
REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer) TO service_role;

-- ═══ 2. Audit: tulis hanya oleh server ═══
REVOKE ALL ON FUNCTION public.log_audit_event(character varying, character varying, uuid, uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_audit_event_for(
  p_user_id uuid,
  p_action character varying,
  p_entity_type character varying DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_organization_id uuid DEFAULT NULL,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_service_role_request() THEN
    RAISE EXCEPTION 'log_audit_event_for: hanya dipanggil dari server (service role)' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, organization_id, old_value, new_value)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_organization_id, p_old_value, p_new_value)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.log_audit_event_for(uuid, character varying, character varying, uuid, uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event_for(uuid, character varying, character varying, uuid, uuid, jsonb, jsonb) TO service_role;

-- ═══ 3. Notifikasi manual: hanya Superadmin/Admin login atau service role ═══
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title character varying,
  p_message text,
  p_related_entity_type character varying DEFAULT NULL,
  p_related_entity_id uuid DEFAULT NULL
) RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification public.notifications;
BEGIN
  IF NOT (public.is_service_role_request()
          OR (auth.uid() IS NOT NULL AND (public.is_superadmin() OR public.current_role_code() = 'admin'))) THEN
    RAISE EXCEPTION 'create_notification: pembuatan notifikasi manual butuh Superadmin/Admin (Gate PRE-00-J §14)' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_entity_type, p_related_entity_id)
  RETURNING * INTO v_notification;

  RETURN v_notification;
END;
$$;

-- ═══ 4. Cabut EXECUTE anon dari RPC yang tak layak dipanggil anon ═══
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname IN ('adjust_learning_points', 'admin_force_provider_connection', 'allocate_quota_capacity', 'cancel_commercial_order',
                        'capture_qualification_evidence_from_session', 'configure_refresh_allowance', 'consume_quota_capacity',
                        'consume_refresh_allowance', 'evaluate_qualification', 'fulfill_commercial_order', 'grant_learning_points_from_purchase',
                        'refresh_listing', 'revoke_dbr_simulation_share', 'share_dbr_simulation', 'create_notification')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.sig);
  END LOOP;
END $$;

-- ═══ 5. Fungsi trigger tidak perlu bisa di-EXECUTE lewat RPC ═══
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.prorettype = 'trigger'::regtype
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
  END LOOP;
END $$;

-- ═══ 6. Kunci search_path ═══
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname IN ('enforce_preset_item_within_role_baseline', 'is_service_role_request', 'enforce_commercial_order_insert_pending',
                        'enforce_payment_transaction_insert_pending', 'prevent_approval_record_mutation', 'addon_capacities_valid',
                        'promotion_benefit_valid', 'promotion_eligibility_valid', 'validate_listing_quota_config', 'listing_quota_free_period',
                        'listing_quota_pro_period', 'promotion_rules_valid')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', f.sig);
  END LOOP;
END $$;
