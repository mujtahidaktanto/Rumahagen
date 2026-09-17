-- 0047_m03_listing_media_analytics.sql
-- Fase 1 dari rencana "100% tabel" (lihat diskusi deep-scan
-- RumahAgen-SaaS-Core-M01-M37.zip): 7 tabel M03 yang STEP10-D tandai
-- PRESERVE_EXACT_PHYSICAL_CORROBORATION (bagian dari 86-table baseline)
-- tapi belum pernah dibuat di migration manapun. Sumber kolom:
-- STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- LISTING_PHOTOS/LISTING_VIDEOS/LISTING_VIEWS/LISTING_LEADS/
-- LISTING_PRICE_HISTORY/LISTING_AMENITIES/AMENITIES — semua kolom persis
-- sesuai `sql_physical_definition` di CSV itu, tanpa deviasi.
--
-- Tidak ada permission baru di sini — semua RLS memakai
-- `m03.listing.update` yang sudah ada (Agent=own, Superadmin=all) lewat
-- join ke `listings.agent_id`, konsisten dengan `listings_update` (0018).
-- Pola join-langsung-di-policy ini AMAN di sini (beda dari kasus M04
-- attendance/0043 yang butuh SECURITY DEFINER) karena
-- `listings_select_published_or_owner_or_staff` sudah cukup permisif untuk
-- semua pemanggil yang berhak (published=publik, owner=lihat sendiri,
-- staff=lihat semua) — sama seperti pola `session_artifacts_select` (0022).

CREATE TABLE IF NOT EXISTS public.listing_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(150),
  is_cover    BOOLEAN NOT NULL DEFAULT false,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  file_hash   VARCHAR(64),
  photo_hash  VARCHAR(64)
);

COMMENT ON TABLE public.listing_photos IS
  'Sumber: STEP10-D entity LISTING_PHOTOS. `file_hash`/`photo_hash` dua kolom terpisah persis sesuai sumber (bukan duplikasi typo) — dipertahankan apa adanya, tidak digabung.';

CREATE TABLE IF NOT EXISTS public.listing_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('video','virtual_tour'))
);

COMMENT ON TABLE public.listing_videos IS 'Sumber: STEP10-D entity LISTING_VIDEOS.';

CREATE TABLE IF NOT EXISTS public.listing_price_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  old_price   DECIMAL(18,2),
  new_price   DECIMAL(18,2),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listing_price_history IS
  'Sumber: STEP10-D entity LISTING_PRICE_HISTORY. ADD-NEW (di luar STEP10-D literal): diisi OTOMATIS lewat trigger `log_listing_price_change()` di bawah saat `listings.price` berubah — bukan tabel yang bisa di-INSERT manual lewat client (tidak ada RLS INSERT untuk siapa pun), supaya riwayat harga tidak bisa dipalsukan. Pola sama seperti `listings.last_refreshed_at` yang hanya berubah lewat `refresh_listing()` (0018/0020).';

CREATE TABLE IF NOT EXISTS public.listing_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listing_views IS
  'Sumber: STEP10-D entity LISTING_VIEWS. Event log kunjungan halaman listing publik — INSERT dibuka untuk siapa pun (termasuk anonim) sesuai sifatnya sebagai page-view counter, SELECT dibatasi pemilik listing/staf.';

CREATE TABLE IF NOT EXISTS public.listing_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source      TEXT NOT NULL DEFAULT 'whatsapp_cta',
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listing_leads IS
  'Sumber: STEP10-D entity LISTING_LEADS. `agent_id` = pemilik listing pada saat lead tercatat (bukan pengunjung — pengunjung tidak wajib punya akun). INSERT dibuka untuk siapa pun (klik CTA WhatsApp dari pengunjung anonim), SELECT dibatasi pemilik listing/staf.';

CREATE TABLE IF NOT EXISTS public.amenities (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(100) NOT NULL UNIQUE
);

COMMENT ON TABLE public.amenities IS
  'Sumber: STEP10-D entity AMENITIES. Katalog referensi (AC, kolam renang, dst.) — dibaca publik, dikelola Superadmin saja (pola sama seperti ref_provinces/0017, bukan resource M03 sendiri).';

CREATE TABLE IF NOT EXISTS public.listing_amenities (
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

COMMENT ON TABLE public.listing_amenities IS
  'Sumber: STEP10-D entity LISTING_AMENITIES. Tabel junction N:N listings<->amenities, tanpa kolom `id` sendiri (PK komposit) — sesuai sifatnya sebagai pure junction table, sama seperti pola `role_permissions`.';

-- ── Trigger: listing_price_history diisi otomatis saat listings.price berubah ──
CREATE OR REPLACE FUNCTION public.log_listing_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price THEN
    INSERT INTO public.listing_price_history (listing_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_listing_price_change IS
  'SECURITY DEFINER supaya INSERT ke listing_price_history berhasil walau tidak ada RLS INSERT untuk siapa pun di tabel itu (pola sama seperti log_audit_event()) — perubahan harga TIDAK melewati RLS pemanggil (Agent pemilik listing), hanya melewati RLS pemilik fungsi.';

CREATE TRIGGER trg_log_listing_price_change
  AFTER UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.log_listing_price_change();

-- ── RLS ──

ALTER TABLE public.listing_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_videos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities     ENABLE ROW LEVEL SECURITY;

-- listing_photos / listing_videos — dibaca sama seperti listing induknya
-- (published publik, owner/staff selalu bisa), dikelola pemilik listing lewat
-- m03.listing.update.
CREATE POLICY listing_photos_select ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_photos.listing_id
        AND (l.status = 'active' OR l.agent_id = auth.uid() OR public.is_superadmin())
    )
  );

CREATE POLICY listing_photos_manage ON public.listing_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_photos.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_photos.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );

CREATE POLICY listing_videos_select ON public.listing_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_videos.listing_id
        AND (l.status = 'active' OR l.agent_id = auth.uid() OR public.is_superadmin())
    )
  );

CREATE POLICY listing_videos_manage ON public.listing_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_videos.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_videos.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );

-- listing_price_history — APPEND-ONLY lewat trigger saja, TIDAK ADA policy
-- INSERT/UPDATE/DELETE untuk siapa pun (pola sama seperti audit_logs/0012).
CREATE POLICY listing_price_history_select ON public.listing_price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_price_history.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );

-- listing_views — INSERT terbuka (page-view counter, termasuk pengunjung
-- anonim), SELECT dibatasi pemilik listing/staf.
CREATE POLICY listing_views_select ON public.listing_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_views.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );

CREATE POLICY listing_views_insert ON public.listing_views
  FOR INSERT WITH CHECK (true);

-- listing_leads — INSERT terbuka (klik CTA WhatsApp dari pengunjung anonim),
-- SELECT dibatasi pemilik listing/staf.
CREATE POLICY listing_leads_select ON public.listing_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_leads.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );

CREATE POLICY listing_leads_insert ON public.listing_leads
  FOR INSERT WITH CHECK (true);

-- amenities — katalog referensi publik, kelola Superadmin saja (pola sama
-- seperti ref_provinces/0017).
CREATE POLICY amenities_select_public ON public.amenities FOR SELECT USING (true);
CREATE POLICY amenities_write_superadmin ON public.amenities FOR ALL
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- listing_amenities — dibaca sama seperti listing induknya, dikelola pemilik
-- listing lewat m03.listing.update (menambah/menghapus amenity dari listing
-- miliknya sendiri).
CREATE POLICY listing_amenities_select ON public.listing_amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_amenities.listing_id
        AND (l.status = 'active' OR l.agent_id = auth.uid() OR public.is_superadmin())
    )
  );

CREATE POLICY listing_amenities_manage ON public.listing_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_amenities.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_amenities.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );
