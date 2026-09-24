-- 0140_m03_m14_listing_quota_engine.sql
-- Kuota penerbitan listing (M03 x M14). Sebelumnya tidak ada batas jumlah listing sama sekali.
--
-- Aturan (keputusan pemilik produk, 2026-09-24):
--   * Kuota dikonsumsi saat listing berubah menjadi `published` (1 jatah per penerbitan). Kuota penuh -> penerbitan ditolak (listing tetap draf).
--   * Dua pemilik kuota: PRIBADI (listing tanpa organization_id) dan ORGANISASI (listing dengan organization_id; agen memilih saat membuat listing;
--     dipakai bersama seluruh anggota). Pemesan hanya boleh memilih organisasi tempat ia anggota aktif.
--   * Sumber kuota, dipakai berurutan: (1) Gratis, (2) Pro, (3) Slot beli (addon capacity_type='listing_slot').
--       Gratis  : pribadi 25, organisasi 50 per BULAN KALENDER, reset tiap tanggal 1 pukul 00:00 WIB (Asia/Jakarta), tanpa carry over.
--       Pro     : pribadi 75, organisasi 100 (di atas Gratis, tidak menggantikan), reset tiap siklus bulanan langganan (juga untuk Pro Tahunan),
--                 tanpa carry over. Tidak ada perpanjangan: perpanjangan = pembelian baru = baris subscriptions baru; siklus dihitung dari starts_at baris aktif terbaru, sehingga tiap pembelian baru mereset kuota Pro.
--       Slot beli: tidak reset dan tidak kedaluwarsa sebelum dipakai (saldo = total capacity 'listing_slot' aktif - slot beli terpakai).
--   * Satu jatah berlaku 90 hari sejak terbit + 7 hari masa tenggang (listing tetap tampil selama tenggang). Setelah itu listing dikembalikan ke draf
--     dan menerbitkan ulang memakai jatah baru. Semua angka dapat diubah Superadmin di system_configs (kunci `listing_quota.*`); batas dibaca saat dipakai.
--   * Jatah hilang bila listing diturunkan/dicabut, KECUALI listing diterbitkan ulang selama jatahnya masih berlaku (mis. diturunkan ke draf untuk
--     diedit lalu diterbitkan lagi): jatah yang sama dipakai ulang tanpa mengurangi kuota dan tanpa memperpanjang masa berlaku.
--   * Tidak ada job reset: pemakaian dihitung per periode (bulan kalender WIB / siklus Pro), jadi reset otomatis saat periode berganti.
--     Yang perlu dijadwalkan hanya `expire_listing_slots()` (pengingat tenggang + pengembalian ke draf), lihat 0141.
-- Listing yang sudah `published` sebelum migration ini tidak punya catatan jatah (tabel listings kosong saat ditulis, dicek live).

-- ═══ 1. Konfigurasi (Superadmin lewat system_configs) ═══
INSERT INTO public.system_configs (config_key, config_value) VALUES
  ('listing_quota.free_personal', '25'),
  ('listing_quota.free_organization', '50'),
  ('listing_quota.pro_personal', '75'),
  ('listing_quota.pro_organization', '100'),
  ('listing_quota.validity_days', '90'),
  ('listing_quota.grace_days', '7'),
  ('listing_quota.pro_product_codes', 'pro_bulanan,pro_tahunan')
ON CONFLICT (config_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.validate_listing_quota_config()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.config_key NOT LIKE 'listing\_quota.%' THEN
    RETURN NEW;
  END IF;
  IF NEW.config_key = 'listing_quota.pro_product_codes' THEN
    IF NEW.config_value IS NULL OR NEW.config_value !~ '^[a-z0-9_]+(,[a-z0-9_]+)*$' THEN
      RAISE EXCEPTION 'system_configs: % harus daftar kode produk (huruf kecil/angka/_) dipisah koma', NEW.config_key USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.config_key IN ('listing_quota.free_personal', 'listing_quota.free_organization', 'listing_quota.pro_personal',
                           'listing_quota.pro_organization', 'listing_quota.validity_days', 'listing_quota.grace_days') THEN
    IF NEW.config_value IS NULL OR NEW.config_value !~ '^[0-9]{1,6}$' THEN
      RAISE EXCEPTION 'system_configs: % harus bilangan bulat 0-999999', NEW.config_key USING ERRCODE = '23514';
    END IF;
    IF NEW.config_key = 'listing_quota.validity_days' AND NEW.config_value::int < 1 THEN
      RAISE EXCEPTION 'system_configs: listing_quota.validity_days minimal 1' USING ERRCODE = '23514';
    END IF;
  ELSE
    RAISE EXCEPTION 'system_configs: kunci % tidak dikenal', NEW.config_key USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_listing_quota_config ON public.system_configs;
CREATE TRIGGER trg_validate_listing_quota_config
  BEFORE INSERT OR UPDATE ON public.system_configs
  FOR EACH ROW EXECUTE FUNCTION public.validate_listing_quota_config();

CREATE OR REPLACE FUNCTION public.listing_quota_int(p_key text, p_default int)
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT NULLIF(config_value, '')::int FROM public.system_configs WHERE config_key = p_key), p_default);
$$;
REVOKE ALL ON FUNCTION public.listing_quota_int(text, int) FROM PUBLIC, anon, authenticated;

-- ═══ 2. Catatan pemakaian jatah ═══
CREATE TABLE IF NOT EXISTS public.listing_slot_usage (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id         UUID,  -- tanpa FK: jatah tetap tercatat meski listing dihapus
  scope              TEXT NOT NULL CHECK (scope IN ('personal', 'organization')),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id    UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  source             TEXT NOT NULL CHECK (source IN ('free', 'pro', 'purchased')),
  period_start       TIMESTAMPTZ,
  consumed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until        TIMESTAMPTZ NOT NULL,
  grace_until        TIMESTAMPTZ NOT NULL,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  ended_at           TIMESTAMPTZ,
  ended_reason       TEXT CHECK (ended_reason IS NULL OR ended_reason IN ('expired')),
  grace_notified_at  TIMESTAMPTZ,
  CONSTRAINT listing_slot_usage_scope_org CHECK ((scope = 'organization') = (organization_id IS NOT NULL)),
  CONSTRAINT listing_slot_usage_period CHECK ((source = 'purchased') = (period_start IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_slot_usage_active ON public.listing_slot_usage (listing_id) WHERE status = 'active' AND listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listing_slot_usage_org ON public.listing_slot_usage (organization_id, source, period_start) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listing_slot_usage_user ON public.listing_slot_usage (user_id, source, period_start) WHERE scope = 'personal';
CREATE INDEX IF NOT EXISTS idx_listing_slot_usage_expiry ON public.listing_slot_usage (grace_until) WHERE status = 'active';

ALTER TABLE public.listing_slot_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS listing_slot_usage_select ON public.listing_slot_usage;
CREATE POLICY listing_slot_usage_select ON public.listing_slot_usage
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
         OR public.has_permission('m03.listing.suspend'));
-- Tidak ada policy tulis: hanya fungsi SECURITY DEFINER di bawah yang menulis.

-- ═══ 4. Periode ═══
CREATE OR REPLACE FUNCTION public.listing_quota_free_period(p_at timestamptz DEFAULT now())
RETURNS TABLE (period_start timestamptz, next_reset timestamptz)
LANGUAGE sql STABLE
AS $$
  SELECT date_trunc('month', p_at AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta',
         (date_trunc('month', p_at AT TIME ZONE 'Asia/Jakarta') + interval '1 month') AT TIME ZONE 'Asia/Jakarta';
$$;

CREATE OR REPLACE FUNCTION public.listing_quota_pro_period(p_anchor timestamptz, p_at timestamptz DEFAULT now())
RETURNS TABLE (period_start timestamptz, next_reset timestamptz)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  a timestamp := p_anchor AT TIME ZONE 'Asia/Jakarta';
  l timestamp := p_at AT TIME ZONE 'Asia/Jakarta';
  n int;
BEGIN
  n := (extract(year FROM age(l, a)) * 12 + extract(month FROM age(l, a)))::int;
  IF a + make_interval(months => n) > l THEN n := n - 1; END IF;
  IF n < 0 THEN n := 0; END IF;
  period_start := (a + make_interval(months => n)) AT TIME ZONE 'Asia/Jakarta';
  next_reset := (a + make_interval(months => n + 1)) AT TIME ZONE 'Asia/Jakarta';
  RETURN NEXT;
END;
$$;

-- ═══ 5. Saldo slot beli ═══
CREATE OR REPLACE FUNCTION public.listing_slot_purchased_balance(p_user_id uuid, p_organization_id uuid)
RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    COALESCE((
      SELECT sum(qc.granted_quantity)
      FROM public.quota_capacities qc
      JOIN public.commercial_entitlements ce ON ce.id = qc.entitlement_id
      WHERE qc.capacity_type = 'listing_slot' AND ce.lifecycle_status = 'active'
        AND ((p_organization_id IS NOT NULL AND ce.organization_id = p_organization_id)
             OR (p_organization_id IS NULL AND ce.user_id = p_user_id AND ce.organization_id IS NULL))
    ), 0)
    - (
      SELECT count(*) FROM public.listing_slot_usage u
      WHERE u.source = 'purchased'
        AND ((p_organization_id IS NOT NULL AND u.organization_id = p_organization_id)
             OR (p_organization_id IS NULL AND u.scope = 'personal' AND u.user_id = p_user_id))
    ), 0);
$$;
REVOKE ALL ON FUNCTION public.listing_slot_purchased_balance(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- ═══ 6. Keadaan kuota (satu sumber kebenaran untuk konsumsi dan ringkasan) ═══
CREATE OR REPLACE FUNCTION public.listing_quota_state(p_user_id uuid, p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org boolean := p_organization_id IS NOT NULL;
  v_free_limit int;
  v_free_used int;
  v_free record;
  v_pro_limit int;
  v_pro_used int := 0;
  v_anchor timestamptz;
  v_pro_active boolean := false;
  v_pro_start timestamptz;
  v_pro_next timestamptz;
  v_purchased numeric;
  v_codes text[];
BEGIN
  v_free_limit := public.listing_quota_int(CASE WHEN v_org THEN 'listing_quota.free_organization' ELSE 'listing_quota.free_personal' END,
                                            CASE WHEN v_org THEN 50 ELSE 25 END);
  SELECT * INTO v_free FROM public.listing_quota_free_period();
  SELECT count(*) INTO v_free_used FROM public.listing_slot_usage u
    WHERE u.source = 'free' AND u.period_start = v_free.period_start
      AND ((v_org AND u.organization_id = p_organization_id) OR (NOT v_org AND u.scope = 'personal' AND u.user_id = p_user_id));

  v_codes := string_to_array(COALESCE((SELECT config_value FROM public.system_configs WHERE config_key = 'listing_quota.pro_product_codes'), 'pro_bulanan,pro_tahunan'), ',');
  SELECT COALESCE(s.starts_at, s.created_at) INTO v_anchor
    FROM public.subscriptions s
    WHERE s.status = 'active' AND (s.starts_at IS NULL OR s.starts_at <= now()) AND (s.ends_at IS NULL OR s.ends_at > now())
      AND s.product_code = ANY (v_codes)
      AND ((v_org AND s.organization_id = p_organization_id) OR (NOT v_org AND s.user_id = p_user_id AND s.organization_id IS NULL))
    ORDER BY COALESCE(s.starts_at, s.created_at) DESC
    LIMIT 1;
  v_pro_limit := public.listing_quota_int(CASE WHEN v_org THEN 'listing_quota.pro_organization' ELSE 'listing_quota.pro_personal' END,
                                          CASE WHEN v_org THEN 100 ELSE 75 END);
  IF v_anchor IS NOT NULL THEN
    v_pro_active := true;
    SELECT p.period_start, p.next_reset INTO v_pro_start, v_pro_next FROM public.listing_quota_pro_period(v_anchor) p;
    SELECT count(*) INTO v_pro_used FROM public.listing_slot_usage u
      WHERE u.source = 'pro' AND u.period_start = v_pro_start
        AND ((v_org AND u.organization_id = p_organization_id) OR (NOT v_org AND u.scope = 'personal' AND u.user_id = p_user_id));
  END IF;
  v_purchased := public.listing_slot_purchased_balance(p_user_id, p_organization_id);

  RETURN jsonb_build_object(
    'scope', CASE WHEN v_org THEN 'organization' ELSE 'personal' END,
    'free', jsonb_build_object('limit', v_free_limit, 'used', v_free_used, 'remaining', GREATEST(v_free_limit - v_free_used, 0),
                               'period_start', v_free.period_start, 'resets_at', v_free.next_reset),
    'pro', jsonb_build_object('active', v_pro_active, 'limit', CASE WHEN v_pro_active THEN v_pro_limit ELSE 0 END, 'used', v_pro_used,
                              'remaining', CASE WHEN v_pro_active THEN GREATEST(v_pro_limit - v_pro_used, 0) ELSE 0 END,
                              'period_start', v_pro_start, 'resets_at', v_pro_next),
    'purchased', jsonb_build_object('balance', v_purchased),
    'total_remaining', GREATEST(v_free_limit - v_free_used, 0) + CASE WHEN v_pro_active THEN GREATEST(v_pro_limit - v_pro_used, 0) ELSE 0 END + v_purchased,
    'validity_days', public.listing_quota_int('listing_quota.validity_days', 90),
    'grace_days', public.listing_quota_int('listing_quota.grace_days', 7)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.listing_quota_state(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- ═══ 7. Konsumsi jatah ═══
CREATE OR REPLACE FUNCTION public.consume_listing_slot(p_listing_id uuid, p_agent_id uuid, p_organization_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org boolean := p_organization_id IS NOT NULL;
  v_row public.listing_slot_usage%ROWTYPE;
  v_state jsonb;
  v_source text;
  v_period timestamptz;
  v_valid timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('listing_slot:' || COALESCE(p_organization_id::text, p_agent_id::text), 0));

  -- Jatah yang masih berlaku dipakai ulang (mis. turun ke draf untuk edit lalu terbit lagi): tanpa konsumsi baru, masa berlaku tidak berubah.
  SELECT * INTO v_row FROM public.listing_slot_usage WHERE listing_id = p_listing_id AND status = 'active';
  IF FOUND THEN
    IF v_row.grace_until > now() THEN
      RETURN v_row.valid_until;
    END IF;
    UPDATE public.listing_slot_usage SET status = 'ended', ended_at = now(), ended_reason = 'expired' WHERE id = v_row.id;
  END IF;

  v_state := public.listing_quota_state(p_agent_id, p_organization_id);
  IF (v_state -> 'free' ->> 'remaining')::int > 0 THEN
    v_source := 'free';
    v_period := (v_state -> 'free' ->> 'period_start')::timestamptz;
  ELSIF (v_state -> 'pro' ->> 'remaining')::int > 0 THEN
    v_source := 'pro';
    v_period := (v_state -> 'pro' ->> 'period_start')::timestamptz;
  ELSIF (v_state -> 'purchased' ->> 'balance')::numeric > 0 THEN
    v_source := 'purchased';
    v_period := NULL;
  ELSE
    RAISE EXCEPTION 'listings: kuota listing % habis (gratis %/%, pro %/%, slot beli %); listing tetap draf sampai kuota tersedia',
      CASE WHEN v_org THEN 'organisasi' ELSE 'pribadi' END,
      v_state -> 'free' ->> 'used', v_state -> 'free' ->> 'limit',
      v_state -> 'pro' ->> 'used', v_state -> 'pro' ->> 'limit',
      v_state -> 'purchased' ->> 'balance'
      USING ERRCODE = '23514';
  END IF;

  v_valid := now() + make_interval(days => (v_state ->> 'validity_days')::int);
  INSERT INTO public.listing_slot_usage (listing_id, scope, user_id, organization_id, source, period_start, valid_until, grace_until)
  VALUES (p_listing_id, CASE WHEN v_org THEN 'organization' ELSE 'personal' END, p_agent_id, p_organization_id, v_source, v_period,
          v_valid, v_valid + make_interval(days => (v_state ->> 'grace_days')::int));
  RETURN v_valid;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_listing_slot(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_listing_quota_on_publish()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid timestamptz;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' THEN
      v_valid := public.consume_listing_slot(NEW.id, NEW.agent_id, NEW.organization_id);
      UPDATE public.listings SET expired_at = v_valid WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
    NEW.expired_at := public.consume_listing_slot(NEW.id, NEW.agent_id, NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_listing_quota_publish_upd ON public.listings;
CREATE TRIGGER trg_listing_quota_publish_upd
  BEFORE UPDATE OF status ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_quota_on_publish();
DROP TRIGGER IF EXISTS trg_listing_quota_publish_ins ON public.listings;
CREATE TRIGGER trg_listing_quota_publish_ins
  AFTER INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_quota_on_publish();

-- ═══ 8. Organisasi pada listing: listing_context konsisten dengan organization_id, hanya anggota, tidak berpindah saat jatah aktif ═══
CREATE OR REPLACE FUNCTION public.enforce_listing_organization_membership()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.listing_context = 'organization') IS DISTINCT FROM (NEW.organization_id IS NOT NULL) THEN
    RAISE EXCEPTION 'listings: listing_context organization harus disertai organization_id, dan sebaliknya' USING ERRCODE = '23514';
  END IF;
  IF auth.uid() IS NULL OR current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.organization_id IS NOT DISTINCT FROM OLD.organization_id THEN
      RETURN NEW;
    END IF;
    IF EXISTS (SELECT 1 FROM public.listing_slot_usage WHERE listing_id = OLD.id AND status = 'active') THEN
      RAISE EXCEPTION 'listings: organisasi listing tidak bisa diubah selama listing memakai jatah kuota aktif' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.organization_id IS NULL OR public.has_permission('m03.listing.suspend') THEN
    RETURN NEW;
  END IF;
  IF NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'listings: pengguna bukan anggota aktif organisasi ini' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_listing_org_membership ON public.listings;
CREATE TRIGGER trg_listing_org_membership
  BEFORE INSERT OR UPDATE OF organization_id, listing_context ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_organization_membership();

-- ═══ 9. Kedaluwarsa: pengingat masa tenggang + pengembalian ke draf ═══
CREATE OR REPLACE FUNCTION public.expire_listing_slots()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_title text;
  v_changed integer;
  v_count integer := 0;
BEGIN
  FOR r IN SELECT * FROM public.listing_slot_usage
           WHERE status = 'active' AND valid_until <= now() AND grace_until > now() AND grace_notified_at IS NULL
           FOR UPDATE SKIP LOCKED LOOP
    SELECT title INTO v_title FROM public.listings WHERE id = r.listing_id AND status = 'published';
    IF FOUND THEN
      PERFORM public.notify_user(r.user_id, 'listing_expiring', 'Listing memasuki masa tenggang',
        'Listing "' || v_title || '" telah melewati masa tayangnya dan tetap tampil sampai ' || to_char(r.grace_until AT TIME ZONE 'Asia/Jakarta', 'DD-MM-YYYY') ||
        '. Setelah itu dikembalikan ke draf; terbitkan ulang memakai kuota baru.', 'listing', r.listing_id);
    END IF;
    UPDATE public.listing_slot_usage SET grace_notified_at = now() WHERE id = r.id;
  END LOOP;

  FOR r IN SELECT * FROM public.listing_slot_usage
           WHERE status = 'active' AND grace_until <= now()
           FOR UPDATE SKIP LOCKED LOOP
    UPDATE public.listings SET status = 'draft' WHERE id = r.listing_id AND status = 'published' RETURNING title INTO v_title;
    GET DIAGNOSTICS v_changed = ROW_COUNT;
    UPDATE public.listing_slot_usage SET status = 'ended', ended_at = now(), ended_reason = 'expired' WHERE id = r.id;
    IF v_changed > 0 THEN
      v_count := v_count + 1;
      PERFORM public.notify_user(r.user_id, 'listing_expiring', 'Listing dikembalikan ke draf',
        'Listing "' || v_title || '" dikembalikan ke draf karena masa tayang dan masa tenggang berakhir. Terbitkan ulang memakai kuota baru.', 'listing', r.listing_id);
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.expire_listing_slots() FROM PUBLIC, anon, authenticated;

-- ═══ 10. Ringkasan untuk pengguna (dipakai API dan layar) ═══
CREATE OR REPLACE FUNCTION public.listing_quota_summary(p_organization_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'listing_quota_summary: login diperlukan' USING ERRCODE = '42501';
  END IF;
  IF p_organization_id IS NOT NULL AND NOT (public.is_org_member(p_organization_id) OR public.has_permission('m03.listing.suspend')) THEN
    RAISE EXCEPTION 'listing_quota_summary: bukan anggota organisasi ini' USING ERRCODE = '42501';
  END IF;
  RETURN public.listing_quota_state(v_uid, p_organization_id);
END;
$$;
REVOKE ALL ON FUNCTION public.listing_quota_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.listing_quota_summary(uuid) TO authenticated;
