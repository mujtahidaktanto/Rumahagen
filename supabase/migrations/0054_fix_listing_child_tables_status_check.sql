-- 0054_fix_listing_child_tables_status_check.sql
-- BUG FUNGSIONAL ditemukan saat pemasangan data uji untuk Fase 1 (0047):
-- listing_photos_select/listing_videos_select/listing_amenities_select
-- memakai `l.status = 'active'`, PADAHAL nilai status publik yang benar di
-- `listings` adalah 'published' (CHECK listings_status_check: draft/
-- pending_review/published/sold/rented/expired/rejected — TIDAK ADA
-- 'active' sama sekali). Salin dari kondisi listings_select_published_
-- or_owner_or_staff (0018) yang salah ditranskripsi ulang alih-alih dirujuk
-- persis. Akibatnya: foto/video/amenity listing yang sudah published TIDAK
-- PERNAH terlihat publik (kondisi status tidak pernah match), walau listing
-- induknya sendiri terlihat normal.
--
-- Perbaikan: DROP + CREATE ulang ketiga policy dengan kondisi PERSIS sama
-- dengan listings_select_published_or_owner_or_staff (termasuk klausul
-- admin/manager yang sebelumnya juga tertinggal, hanya is_superadmin()).

DROP POLICY IF EXISTS listing_photos_select ON public.listing_photos;
CREATE POLICY listing_photos_select ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_photos.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
        )
    )
  );

DROP POLICY IF EXISTS listing_videos_select ON public.listing_videos;
CREATE POLICY listing_videos_select ON public.listing_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_videos.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
        )
    )
  );

DROP POLICY IF EXISTS listing_amenities_select ON public.listing_amenities;
CREATE POLICY listing_amenities_select ON public.listing_amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_amenities.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
        )
    )
  );
