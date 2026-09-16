-- 0020_m03_m14_refresh_allowance_invocation.sql
-- Menutup D13-01 secara fisik: "M14→M03 commercial-capacity invocation remains
-- semantic/data-contract evidence; no exact internal API-to-API invocation
-- contract is evidenced" — file ini ADALAH kontrak invocation yang dimaksud:
-- dua fungsi SQL nyata yang benar-benar saling memanggil, bukan lagi semantik di
-- atas kertas. Melengkapi R-04 ("M14 sebagai pemilik allowance; M03 sebagai
-- konsumen — pastikan arahnya benar di kode").
--
-- Sumber alur & aturan bisnis: Gate PRE-00-E §27 (13-step server-side semantic
-- flow untuk POST /listings/{id}/refresh) — diimplementasikan hampir persis,
-- dengan SATU deviasi urutan terdokumentasi (lihat catatan di refresh_listing()
-- di bawah): urutan pengecekan kuota-agent vs kuota-listing ditukar demi
-- atomicity transaksional, tanpa mengubah hasil akhir yang teramati.

-- ── (M14) consume_refresh_allowance — realisasi fisik verb "consume" ──
-- Dipanggil HANYA dari refresh_listing() di bawah (M03), tidak dipanggil
-- langsung oleh client. Bertanggung jawab MURNI atas kuota tingkat AGENT
-- (Gate §33: "M14 owns commercial entitlement/quota values"); kuota tingkat
-- LISTING (satu kali per listing per hari) adalah tanggung jawab M03, dicek di
-- refresh_listing(), BUKAN di sini — menjaga batas wewenang M03/M14 (Gate §16,
-- "M14 does NOT own the Listing Refresh action").
CREATE OR REPLACE FUNCTION public.consume_refresh_allowance(
  p_agent_id          UUID,
  p_resource_reference TEXT,
  p_idempotency_key    TEXT DEFAULT NULL
)
RETURNS TABLE (allowed BOOLEAN, remaining_today INTEGER, pool_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool_id    UUID;
  v_allowance  INTEGER;
  v_used_today INTEGER;
  v_operational_day DATE;
BEGIN
  IF NOT public.has_permission('m14.refresh_allowance_entitlement.consume', p_agent_id) THEN
    RAISE EXCEPTION 'consume_refresh_allowance: butuh permission m14.refresh_allowance_entitlement.consume (D13-01)';
  END IF;

  v_operational_day := (now() AT TIME ZONE 'Asia/Jakarta')::date;  -- Gate PRE-00-E §19

  SELECT oqp.id, qc.daily_refresh_allowance
  INTO v_pool_id, v_allowance
  FROM public.operational_quota_pools oqp
  JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
  WHERE oqp.user_id = p_agent_id
    AND qc.capacity_type = 'listing_refresh'
    AND oqp.pool_status = 'active'
  ORDER BY oqp.created_at DESC
  LIMIT 1;

  IF v_pool_id IS NULL THEN
    -- Agent belum pernah di-Configure sama sekali oleh Superadmin — bukan error,
    -- ini kondisi bisnis valid (belum ada allowance = tidak bisa refresh).
    RETURN QUERY SELECT false, 0, NULL::UUID;
    RETURN;
  END IF;

  -- Replay idempotency: key yang sama pernah sukses konsumsi → kembalikan hasil
  -- yang identik, jangan hitung/insert dua kali (pola sama seperti
  -- lib/api/idempotency.ts, tapi di level event bisnis, bukan level HTTP).
  IF p_idempotency_key IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.quota_usage WHERE idempotency_key = p_idempotency_key)
  THEN
    SELECT count(*) INTO v_used_today
    FROM public.quota_usage qu
    WHERE qu.operational_quota_pool_id = v_pool_id
      AND (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date = v_operational_day;
    RETURN QUERY SELECT true, GREATEST(v_allowance - v_used_today, 0), v_pool_id;
    RETURN;
  END IF;

  SELECT count(*) INTO v_used_today
  FROM public.quota_usage qu
  WHERE qu.operational_quota_pool_id = v_pool_id
    AND (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date = v_operational_day;
  -- "No carry-forward" (Gate §19) tercapai otomatis di sini: hari sudah ganti →
  -- COUNT hari ini nol, tanpa proses reset/cron apa pun (lihat catatan desain
  -- di 0019).

  IF v_used_today >= v_allowance THEN
    RETURN QUERY SELECT false, 0, v_pool_id;
    RETURN;
  END IF;

  INSERT INTO public.quota_usage (
    operational_quota_pool_id, consuming_resource_type, consuming_resource_reference,
    consumed_quantity, idempotency_key
  ) VALUES (
    v_pool_id, 'listing_refresh', p_resource_reference, 1, p_idempotency_key
  );

  RETURN QUERY SELECT true, GREATEST(v_allowance - v_used_today - 1, 0), v_pool_id;
END;
$$;

COMMENT ON FUNCTION public.consume_refresh_allowance IS
  'Realisasi fisik verb "consume" M14 (D13-01). Mengembalikan allowed=false untuk kondisi bisnis normal (belum di-configure / kuota habis) — TIDAK RAISE EXCEPTION untuk itu, supaya pemanggil (refresh_listing) bisa memberi respons bisnis yang rapi, bukan menangkap Postgres exception. Hanya RAISE EXCEPTION untuk pelanggaran otorisasi.';

-- ── (M03) refresh_listing — pemilik penuh Refresh action (Gate §16, §33) ──
-- Satu-satunya jalur resmi listings.last_refreshed_at berubah (ditegakkan
-- trigger trg_listing_lifecycle_rules di 0018 lewat flag
-- rumahagen.refresh_in_progress). Mengimplementasikan alur 13-langkah Gate
-- PRE-00-E §27, DENGAN SATU DEVIASI URUTAN TERDOKUMENTASI: Gate menulis "step 7
-- cek kuota agent, step 8 cek kuota listing" (agent dulu, listing belakangan).
-- Di sini urutannya DITUKAR (listing dulu, agent lewat consume_refresh_allowance
-- belakangan) supaya tidak perlu "membatalkan" konsumsi kuota agent kalau
-- ternyata listing-nya sendiri sudah kena guard once-per-day — hasil akhir yang
-- teramati IDENTIK (refresh gagal di kedua kasus, kuota agent tidak berkurang
-- kalau listing-guard yang gagal), tapi implementasinya jadi atomik tanpa perlu
-- rollback manual. Kalau urutan literal step 7-sebelum-8 ternyata krusial untuk
-- kebutuhan lain (mis. pesan error harus spesifik "kuota habis" bahkan saat
-- listing juga sudah pernah di-refresh), itu residual baru untuk direvisi, bukan
-- diasumsikan di sini.
CREATE OR REPLACE FUNCTION public.refresh_listing(p_listing_id UUID)
RETURNS TABLE (success BOOLEAN, reason TEXT, remaining_today INTEGER, refreshed_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing          public.listings;
  v_operational_day  DATE;
  v_last_refresh_day DATE;
  v_consume          RECORD;
BEGIN
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;

  IF v_listing.id IS NULL THEN
    RETURN QUERY SELECT false, 'listing_not_found', NULL::INTEGER, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Step 1-3 Gate §27: authenticate (implisit lewat auth.uid()), authorize,
  -- resolve ownership — has_permission() dengan OWN scope menegakkan ketiganya
  -- sekaligus (Superadmin lolos via is_superadmin(), Agent hanya lolos untuk
  -- listing miliknya sendiri).
  IF NOT public.has_permission('m03.listing.refresh', v_listing.agent_id) THEN
    RAISE EXCEPTION 'refresh_listing: tidak punya permission m03.listing.refresh untuk listing %', p_listing_id;
  END IF;

  -- Step 4 Gate §27: wajib PUBLISHED (Gate §32).
  IF v_listing.status <> 'published' THEN
    RETURN QUERY SELECT false, 'listing_not_published', NULL::INTEGER, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Step 6+8 Gate §27 (dikerjakan lebih dulu di sini, lihat catatan deviasi
  -- urutan di atas fungsi): satu listing hanya boleh sukses refresh sekali per
  -- operational day (Gate §20, terpisah dari kuota Agent).
  v_operational_day := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  IF v_listing.last_refreshed_at IS NOT NULL THEN
    v_last_refresh_day := (v_listing.last_refreshed_at AT TIME ZONE 'Asia/Jakarta')::date;
    IF v_last_refresh_day = v_operational_day THEN
      RETURN QUERY SELECT false, 'listing_already_refreshed_today', NULL::INTEGER, v_listing.last_refreshed_at;
      RETURN;
    END IF;
  END IF;

  -- Step 5+7 Gate §27: resolve & konsumsi entitlement Agent — INI panggilan
  -- fisik M03→M14 yang dimaksud D13-01, bukan lagi semantik di dokumen.
  SELECT * INTO v_consume
  FROM public.consume_refresh_allowance(v_listing.agent_id, p_listing_id::text);

  IF NOT v_consume.allowed THEN
    -- Step 26 Gate: Refresh gagal → 0 kuota terpakai (otomatis benar di sini
    -- karena consume_refresh_allowance TIDAK insert apa pun saat allowed=false).
    RETURN QUERY SELECT false, 'agent_daily_quota_exhausted', v_consume.remaining_today, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Step 9-11 Gate §27: catat timestamp server-otoritatif, update freshness.
  -- Flag transaksi lokal supaya trigger 0018 mengizinkan perubahan
  -- last_refreshed_at ini (satu-satunya jalur resmi, lihat komentar di 0018).
  PERFORM set_config('rumahagen.refresh_in_progress', 'true', true);

  UPDATE public.listings
  SET last_refreshed_at = now(), updated_at = now()
  WHERE id = p_listing_id;

  PERFORM set_config('rumahagen.refresh_in_progress', 'false', true);

  -- Step 12 Gate §27: audit provenance lewat boundary M09 (log_audit_event, 0012)
  -- — bukan audit authority baru (Gate §29: "M03 does not create a parallel
  -- audit authority").
  PERFORM public.log_audit_event(
    p_action      := 'm03.listing.refresh',
    p_entity_type := 'listings',
    p_entity_id   := p_listing_id,
    p_organization_id := v_listing.organization_id,
    p_new_value   := jsonb_build_object('remaining_today', v_consume.remaining_today)
  );

  -- Step 13 Gate §27: kembalikan freshness + sisa kuota harian.
  RETURN QUERY SELECT true, 'ok', v_consume.remaining_today, now();
END;
$$;

COMMENT ON FUNCTION public.refresh_listing IS
  'Realisasi fisik POST /listings/{id}/refresh (Gate PRE-00-E §27) di level database — satu-satunya jalur resmi konsumsi Refresh. Rute REST pembungkusnya sendiri (Step 3/STEP-11) belum ditulis, di luar scope migration Tahap 4. R-04/D13-01: fungsi ini SECARA FISIK memanggil consume_refresh_allowance() (M14) alih-alih menyimpan counter kuota sendiri di tabel listings — arah panggilan yang benar sesuai keputusan R-04.';
