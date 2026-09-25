-- 0154_m11_listing_discovery_indexes.sql
-- Indeks untuk Discovery listing publik (M11: Homepage "Properti Pilihan" dan /listing). Sebelumnya hanya ada indeks FK wilayah/agen dan freshness_rank_at global;
-- urutan harga (ORDER BY price) dan filter tipe properti membaca seluruh tabel (terukur di 30.000 listing: 17-32 ms -> 0,05 ms untuk urutan harga).
-- Semua query publik memakai `status = 'published' AND deleted_at IS NULL`, jadi seluruh indeks di sini PARSIAL dengan predikat yang sama: lebih kecil, dan hanya
-- dipakai bila query memuat predikat itu (query staf/pemilik yang melihat draft tidak terpengaruh dan tetap memakai indeks lama, yang TIDAK dihapus).
-- Tidak mengubah data, kolom, RLS, atau perilaku API.
--
-- SENGAJA TIDAK ADA indeks trigram (pg_trgm) untuk pencarian kata kunci: diuji di 30.000 listing, indeks itu dipakai bila query berjalan tanpa RLS (1,3 ms) tetapi TIDAK
-- dipakai untuk anon/authenticated (100 ms) karena operator ILIKE tidak leakproof, sehingga planner tidak boleh menjadikannya kondisi indeks di bawah policy RLS
-- listings_select_published_or_owner_or_staff. Memakainya butuh fungsi SECURITY DEFINER khusus pencarian: keputusan terpisah (lihat audit/FRONTEND_GAPS.md).

-- Urutan bawaan (terbaru): ORDER BY freshness_rank_at DESC, id ASC LIMIT n (Homepage dan Discovery).
CREATE INDEX IF NOT EXISTS idx_listings_pub_freshness
  ON public.listings (freshness_rank_at DESC, id)
  WHERE status = 'published' AND deleted_at IS NULL;

-- Urutan harga: termurah = price ASC, id ASC; termahal = price DESC, id ASC (tie-break id searah dengan query, sehingga tanpa sort tambahan).
CREATE INDEX IF NOT EXISTS idx_listings_pub_price_asc
  ON public.listings (price, id)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_listings_pub_price_desc
  ON public.listings (price DESC, id)
  WHERE status = 'published' AND deleted_at IS NULL;

-- Filter tipe properti + urutan terbaru.
CREATE INDEX IF NOT EXISTS idx_listings_pub_type_freshness
  ON public.listings (property_type, freshness_rank_at DESC, id)
  WHERE status = 'published' AND deleted_at IS NULL;
