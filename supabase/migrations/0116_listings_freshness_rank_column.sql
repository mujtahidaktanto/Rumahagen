-- 0116_listings_freshness_rank_column.sql
-- Menutup gap: GET /listings (API-025, apps/web/app/api/listings/route.ts)
-- mengurutkan hasil dengan `ORDER BY created_at DESC` -- Refresh
-- (0020_m03_m14_refresh_allowance_invocation.sql, Gate PRE-00-E) sama
-- sekali TIDAK berefek ke urutan tampil publik, padahal Gate §26 eksplisit:
-- "successful Refresh repositions... latest successful Refresh ranks first
-- within the governed District-local freshness ordering."
--
-- KEPUTUSAN REKAYASA: urutan yang benar adalah
-- `COALESCE(last_refreshed_at, published_at) DESC` -- listing yang belum
-- pernah di-refresh tetap terurut dari published_at aslinya (last_refreshed_at
-- NULL sampai Refresh pertama, lihat trigger enforce_listing_lifecycle_rules
-- di 0018 -- publish TIDAK mengisi last_refreshed_at), listing yang sudah
-- di-refresh naik ke posisi seolah baru publish saat ini juga.
--
-- Supabase JS/PostgREST query builder (.order()) tidak punya jalur untuk
-- ekspresi SQL mentah seperti COALESCE(...) -- hanya bisa order by nama
-- kolom fisik/view. Solusi paling sederhana yang tidak mengubah semantik
-- last_refreshed_at/published_at yang sudah ada (dan tidak menyentuh trigger
-- guard R-04 di 0018 sama sekali): kolom GENERATED ALWAYS STORED yang
-- otomatis mengikuti kedua kolom sumber -- tidak ada jalur tulis manual,
-- tidak ada risiko lolos dari guard trigger last_refreshed_at yang sudah ada.
ALTER TABLE public.listings
  ADD COLUMN freshness_rank_at TIMESTAMPTZ
    GENERATED ALWAYS AS (COALESCE(last_refreshed_at, published_at)) STORED;

COMMENT ON COLUMN public.listings.freshness_rank_at IS
  'ADD-NEW 0116 -- kunci urut publik untuk GET /listings (Gate PRE-00-E §26, "District-local freshness ordering"). GENERATED STORED dari COALESCE(last_refreshed_at, published_at); tidak ada jalur tulis manual, otomatis ikut berubah saat refresh_listing() (0020) mengisi last_refreshed_at. NULL untuk listing yang belum pernah publish -- tidak relevan karena hanya listing published yang tampil di pencarian publik.';

-- Index untuk performa ORDER BY (dipakai pada setiap request GET /listings
-- publik, termasuk yang difilter district_id -- index komposit supaya query
-- district-filtered tetap kena index-only scan untuk urutan, bukan cuma
-- filter district_id sendirian).
CREATE INDEX idx_listings_district_freshness_rank
  ON public.listings (district_id, freshness_rank_at DESC);

CREATE INDEX idx_listings_freshness_rank
  ON public.listings (freshness_rank_at DESC);
