-- 0119_fix_null_superadmin_bypass_batch.sql
-- Lanjutan 0118 (yang menutup NULL-bypass di share_dbr_simulation()/
-- revoke_dbr_simulation_share()) — 4 fungsi/trigger LAIN yang ditemukan
-- lewat grep memakai pola guard yang PERSIS sama (`IF NOT public.
-- is_superadmin() THEN RAISE EXCEPTION`, tanpa ELSE fallback): kalau
-- auth.uid() tidak match baris mana pun di public.users (race condition
-- sinkronisasi auth.users<->public.users saat signup, atau user yang
-- dihapus tapi sesinya belum kedaluwarsa), current_role_code() (0006)
-- mengembalikan NULL, is_superadmin() = NULL (bukan FALSE), dan `NOT NULL`
-- = NULL diperlakukan PL/pgSQL sama seperti FALSE -- RAISE EXCEPTION
-- tidak pernah terpicu, caller yang datanya tidak dikenali lolos seolah
-- Superadmin.
--
-- CATATAN PENTING soal reachability (supaya tidak dibaca sebagai 4 bug
-- dengan tingkat keparahan sama): has_permission() (0006, dipakai HAMPIR
-- semua RLS project) TIDAK kena pola ini -- fungsi itu punya ELSE fallback
-- eksplisit (RETURN FALSE) di ujung IF/ELSIF-nya, jadi caller tak dikenal
-- selalu fail CLOSED lewat has_permission(). Dua dari empat fungsi di
-- bawah (configure_refresh_allowance/0019, grant_learning_points_from_
-- purchase/0025) SAMA SEKALI TIDAK digerbangi RLS INSERT/UPDATE apa pun
-- (SECURITY DEFINER murni, satu-satunya gerbang ADALAH is_superadmin()
-- di dalam fungsi itu sendiri) -- untuk keduanya bug ini reachable
-- LANGSUNG oleh siapa pun dengan auth.uid() tak dikenal. Dua lainnya
-- (enforce_partnership_result_validation_superadmin_only/0024,
-- enforce_organization_invitation_no_self_accept/0050) ada DI BELAKANG
-- RLS UPDATE yang sudah memanggil has_permission() (aman) untuk SEBAGIAN
-- besar jalur -- TAPI 0050 punya klausa USING tambahan `agent_id =
-- auth.uid()` yang tidak melalui has_permission() sama sekali, jadi tetap
-- reachable untuk skenario auth.uid() yatim yang PERSIS match agent_id/
-- leader_id baris itu. Keempatnya diperbaiki di sini demi defense-in-depth
-- yang konsisten, bukan karena semuanya sama-sama exploitable hari ini.
--
-- FIX SERAGAM: bungkus setiap pemanggilan is_superadmin() yang dipakai
-- sebagai satu-satunya guard dengan COALESCE(..., false) -- NULL
-- diperlakukan sebagai "bukan superadmin" (fail CLOSED), bukan "entah"
-- yang ternyata diperlakukan sebagai lolos. CREATE OR REPLACE FUNCTION
-- pada nama yang SAMA di keempatnya (bukan fungsi/trigger baru) -- pola
-- konsisten proyek ini untuk memperbaiki migration yang sudah applied.

-- ── 1. configure_refresh_allowance() (0019, M14 Refresh Allowance Configure) ──
CREATE OR REPLACE FUNCTION public.configure_refresh_allowance(
  p_agent_id UUID,
  p_daily_allowance INTEGER DEFAULT 5
)
RETURNS public.operational_quota_pools
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entitlement_id UUID;
  v_capacity_id    UUID;
  v_pool           public.operational_quota_pools;
BEGIN
  IF NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'configure_refresh_allowance: butuh permission m14.refresh_allowance_entitlement.configure dengan scope Superadmin (lihat catatan keputusan RLS di migration ini)';
  END IF;

  IF p_daily_allowance < 0 THEN
    RAISE EXCEPTION 'configure_refresh_allowance: p_daily_allowance tidak boleh negatif';
  END IF;

  SELECT id INTO v_entitlement_id
  FROM public.commercial_entitlements
  WHERE user_id = p_agent_id AND entitlement_type = 'listing_refresh_allowance' AND lifecycle_status = 'active'
  LIMIT 1;

  IF v_entitlement_id IS NULL THEN
    INSERT INTO public.commercial_entitlements (user_id, entitlement_type, lifecycle_status, starts_at)
    VALUES (p_agent_id, 'listing_refresh_allowance', 'active', now())
    RETURNING id INTO v_entitlement_id;
  END IF;

  SELECT id INTO v_capacity_id
  FROM public.quota_capacities
  WHERE entitlement_id = v_entitlement_id AND capacity_type = 'listing_refresh'
  LIMIT 1;

  IF v_capacity_id IS NULL THEN
    INSERT INTO public.quota_capacities (entitlement_id, capacity_type, granted_quantity, daily_refresh_allowance)
    VALUES (v_entitlement_id, 'listing_refresh', p_daily_allowance, p_daily_allowance)
    RETURNING id INTO v_capacity_id;
  ELSE
    UPDATE public.quota_capacities
    SET daily_refresh_allowance = p_daily_allowance,
        granted_quantity = p_daily_allowance,
        updated_at = now()
    WHERE id = v_capacity_id;
  END IF;

  SELECT * INTO v_pool
  FROM public.operational_quota_pools
  WHERE quota_capacity_id = v_capacity_id AND user_id = p_agent_id
  LIMIT 1;

  IF v_pool.id IS NULL THEN
    INSERT INTO public.operational_quota_pools (quota_capacity_id, user_id, pool_status, operational_quantity)
    VALUES (v_capacity_id, p_agent_id, 'active', p_daily_allowance)
    RETURNING * INTO v_pool;

    INSERT INTO public.quota_allocations
      (operational_quota_pool_id, beneficiary_user_id, allocated_quantity, status, effective_from)
    VALUES (v_pool.id, p_agent_id, p_daily_allowance, 'active', now());
  ELSE
    UPDATE public.operational_quota_pools
    SET operational_quantity = p_daily_allowance, updated_at = now()
    WHERE id = v_pool.id
    RETURNING * INTO v_pool;
  END IF;

  PERFORM public.log_audit_event(
    p_action      := 'm14.refresh_allowance_entitlement.configure',
    p_entity_type := 'operational_quota_pools',
    p_entity_id   := v_pool.id,
    p_new_value   := jsonb_build_object('agent_id', p_agent_id, 'daily_allowance', p_daily_allowance)
  );

  RETURN v_pool;
END;
$$;

COMMENT ON FUNCTION public.configure_refresh_allowance IS
  'DIPERBAIKI 0119 -- NULL-bypass pada guard is_superadmin() ditutup dengan COALESCE(..., false). Realisasi fisik verb "Configure" dari M14 Refresh Allowance/Entitlement (Gate PRE-00-E §18: "Configuration actor = Superadmin"). Tidak digerbangi RLS apa pun -- is_superadmin() di sini SATU-SATUNYA gerbang, jadi bug NULL-bypass sebelumnya reachable langsung.';

-- ── 2. enforce_partnership_result_validation_superadmin_only() (0024, M04) ──
CREATE OR REPLACE FUNCTION public.enforce_partnership_result_validation_superadmin_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validation_status IS DISTINCT FROM OLD.validation_status THEN
    IF NOT COALESCE(public.is_superadmin(), false) THEN
      RAISE EXCEPTION 'partnership_learning_results: hanya Superadmin yang boleh mengubah validation_status (Gate PRE-00-F §51)';
    END IF;
    NEW.validated_by := auth.uid();
    NEW.validated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION public.enforce_partnership_result_validation_superadmin_only IS
  'DIPERBAIKI 0119 -- NULL-bypass pada guard is_superadmin() ditutup dengan COALESCE(..., false). Hanya Superadmin yang boleh mengubah validation_status (Gate PRE-00-F §51).';

-- ── 3. grant_learning_points_from_purchase() (0025, M14->M04 invocation) ──
CREATE OR REPLACE FUNCTION public.grant_learning_points_from_purchase(
  p_user_id           UUID,
  p_amount            NUMERIC(18,2),
  p_source_reference  TEXT,
  p_idempotency_key   TEXT DEFAULT NULL
)
RETURNS public.learning_point_transactions
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_txn        public.learning_point_transactions;
BEGIN
  IF NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: untuk saat ini hanya Superadmin bisa memanggil (lihat catatan keputusan di komentar migration 0025 — pipeline fulfillment M14 otomatis belum ada)';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: p_amount harus > 0 (ini grant/kredit; pemakaian LP/debit memakai jalur transaksi lain, bukan fungsi ini)';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn FROM public.learning_point_transactions WHERE idempotency_key = p_idempotency_key;
    IF v_txn.id IS NOT NULL THEN
      RETURN v_txn;
    END IF;
  END IF;

  SELECT id INTO v_account_id FROM public.learning_point_accounts WHERE user_id = p_user_id;
  IF v_account_id IS NULL THEN
    INSERT INTO public.learning_point_accounts (user_id) VALUES (p_user_id)
    RETURNING id INTO v_account_id;
  END IF;

  INSERT INTO public.learning_point_transactions (
    account_id, user_id, transaction_type, amount, source_type, source_reference, idempotency_key
  ) VALUES (
    v_account_id, p_user_id, 'purchased', p_amount, 'm14_commercial_fulfillment', p_source_reference, p_idempotency_key
  )
  RETURNING * INTO v_txn;

  PERFORM public.log_audit_event(
    p_action      := 'm04.learning_point.grant_from_purchase',
    p_entity_type := 'learning_point_transactions',
    p_entity_id   := v_txn.id,
    p_new_value   := jsonb_build_object('user_id', p_user_id, 'amount', p_amount, 'source_reference', p_source_reference)
  );

  RETURN v_txn;
END;
$$;

COMMENT ON FUNCTION public.grant_learning_points_from_purchase IS
  'DIPERBAIKI 0119 -- NULL-bypass pada guard is_superadmin() ditutup dengan COALESCE(..., false). Realisasi fisik D13-02: kontrak invocation M14->M04 untuk purchased-LP handoff. Tidak digerbangi RLS apa pun -- is_superadmin() di sini SATU-SATUNYA gerbang, jadi bug NULL-bypass sebelumnya reachable langsung.';

-- ── 4. enforce_organization_invitation_no_self_accept() (0050, M12) ──
CREATE OR REPLACE FUNCTION public.enforce_organization_invitation_no_self_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    IF NOT COALESCE(public.is_superadmin(), false) THEN
      IF NEW.initiated_by_type = 'agent_request' AND auth.uid() = NEW.agent_id THEN
        RAISE EXCEPTION 'organization_invitations: agent tidak boleh menyetujui agent_request miliknya sendiri — hanya leader/staf';
      END IF;
      IF NEW.initiated_by_type = 'leader_invite' AND auth.uid() = NEW.leader_id THEN
        RAISE EXCEPTION 'organization_invitations: leader tidak boleh menyetujui leader_invite yang ia buat sendiri — hanya agent yang diundang/staf';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION public.enforce_organization_invitation_no_self_accept IS
  'DIPERBAIKI 0119 -- NULL-bypass pada guard is_superadmin() ditutup dengan COALESCE(..., false). RLS organization_invitations_update punya klausa `agent_id = auth.uid()` yang tidak lewat has_permission(), jadi guard is_superadmin() di sini adalah lapisan proteksi nyata (bukan cuma redundan) untuk skenario auth.uid() yang match agent_id/leader_id baris tapi tidak match baris public.users manapun.';
