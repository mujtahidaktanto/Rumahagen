-- 0173_m03_listing_engagement_counts.sql
-- Celah ditemukan lewat testing live 2026-10-01: kartu "Listing Saya" dan Detail Listing menampilkan "dilihat"/jumlah CTA dari listings.view_count/
-- cta_click_count (0018) -- DUA KOLOM MATI, tidak pernah ada kode/trigger yang menambah nilainya sejak fitur ini dibuat. Pencatatan sungguhan SUDAH
-- benar sejak awal: tiap kunjungan halaman publik masuk ke listing_views (POST /api/listings/{id}/views, ViewTracker.tsx) dan tiap klik WhatsApp masuk
-- ke listing_leads (POST /api/listings/{id}/cta-click) -- bukti: halaman "Statistik Saya" (agent_statistics_summary, 0125/0159/0162) sudah benar karena
-- menghitung langsung dari dua tabel itu, bukan dari kolom listings.
--
-- Keputusan pemilik produk (2026-10-01, ditanya langsung): (1) hitung LANGSUNG dari listing_views/listing_leads (count live, bukan kolom
-- denormalisasi disinkronkan trigger) -- satu sumber kebenaran, sama seperti Statistik Saya; (2) kunjungan Agent ke listingnya sendiri tetap ikut
-- terhitung (tidak ada pengecualian pemilik).
--
-- RPC baru (bukan sekadar ganti SELECT di app code) karena listing_views_select/listing_leads_select (0047) SENGAJA tidak membuka akses pemimpin
-- organisasi ke listing anggota (privasi kontak calon pembeli -- dicatat eksplisit di komentar migration 0162 "Leads listing tetap hanya untuk
-- pemilik listing"). Fungsi ini HANYA mengembalikan ANGKA (bukan baris lead/kontak), jadi aman dibuka ke pemimpin -- pola sama persis seperti blok
-- 'members' di agent_statistics_summary (0162) yang sudah mengekspos jumlah views/leads per anggota ke pemimpinnya. Otorisasi baris disalin PERSIS
-- dari listings_select_published_or_owner_or_staff (0162), minus cabang publik (status='published') yang tidak relevan di sini.
CREATE OR REPLACE FUNCTION public.listing_engagement_counts(p_listing_ids uuid[])
RETURNS TABLE (listing_id uuid, views bigint, leads bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'listing_engagement_counts: login diperlukan' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
    SELECT l.id,
           (SELECT count(*) FROM public.listing_views v WHERE v.listing_id = l.id),
           (SELECT count(*) FROM public.listing_leads ll WHERE ll.listing_id = l.id)
    FROM public.listings l
    WHERE l.id = ANY(p_listing_ids)
      AND (
        l.agent_id = auth.uid()
        OR public.is_superadmin()
        OR public.current_role_code() IN ('admin', 'manager')
        OR (l.organization_id IS NOT NULL AND public.is_org_leader(l.organization_id))
      );
END;
$$;

REVOKE ALL ON FUNCTION public.listing_engagement_counts(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.listing_engagement_counts(uuid[]) TO authenticated;
