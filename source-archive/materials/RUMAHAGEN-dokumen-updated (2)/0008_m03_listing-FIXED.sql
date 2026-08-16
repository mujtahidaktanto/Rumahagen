-- ============================================================================
-- Migration 0008: Modul 3 — Manajemen Listing Properti (tabel inti platform)
-- ENT: ENT-M03-Listing dan seluruh child entity
-- Bergantung: 0003 (users), 0004 (ref_*), 0006 (developer_projects), 0007 (organizations)
-- ============================================================================
-- CHANGELOG:
-- [2026-08-10] Fix RLS listings_select_public (T1-02, Konflik #1 MP-03/MP-11)
--   DAN Fix RLS Org Leader di 3 child-table policy (Konflik #2 MP-03).
--   Dokumen MP-03 dan CHANGELOG-v0.7.1/v0.7.2 mencatat KEDUA perbaikan ini
--   sebagai "✅ Diperbaiki [2026-08-06]" — namun verifikasi audit konsolidasi
--   9-10 Agustus 2026 membuktikan file migration ini (versi sebelum patch ini)
--   TIDAK PERNAH benar-benar diubah untuk keduanya. Regresi kelima & keenam
--   dari pola yang sama dengan migration 0009/0010 dan API Spec §10.3/§11.3
--   — klaim "Diperbaiki" di dokumentasi tidak tercermin di file sumber.
--   1. listings_select_public sekarang benar-benar mengizinkan
--      status IN ('published','sold','rented') — listing terjual/tersewa
--      tetap dapat diakses publik, mempertahankan nilai SEO (SEO Spec §1.4).
--   2. listing_photos_manage/listing_videos_manage/listing_amenities_manage
--      sekarang benar-benar memuat klausa Organization Leader (pola sama
--      listings_update_own_or_org_leader) — Org Leader dapat kelola
--      foto/video/amenity listing anggota Organization-nya, bukan hanya
--      field utama listing.
-- ============================================================================

CREATE TABLE listings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  developer_project_id      UUID REFERENCES developer_projects(id) ON DELETE SET NULL,
  organization_id           UUID REFERENCES organizations(id) ON DELETE SET NULL,  -- v1.3
  listing_context           TEXT NOT NULL DEFAULT 'personal' CHECK (listing_context IN ('personal','organization')),
  category                  TEXT NOT NULL CHECK (category IN ('primary','secondary')),
  transaction_type          TEXT NOT NULL CHECK (transaction_type IN ('sale','rent')),
  title                     VARCHAR(200) NOT NULL,
  slug                      VARCHAR(220) UNIQUE NOT NULL,
  meta_title                VARCHAR(70),
  meta_description          VARCHAR(160),
  description               TEXT,
  property_type             TEXT NOT NULL CHECK (property_type IN ('rumah','apartemen','ruko','tanah','gudang','kavling','lainnya')),
  price                     DECIMAL(18,2) NOT NULL,
  price_unit                TEXT CHECK (price_unit IN ('total','per_bulan','per_tahun')),
  is_negotiable             BOOLEAN NOT NULL DEFAULT false,
  address                   VARCHAR(500) NOT NULL,
  province_id               UUID NOT NULL REFERENCES ref_provinces(id) ON DELETE RESTRICT,
  city_id                   UUID NOT NULL REFERENCES ref_cities(id) ON DELETE RESTRICT,
  district_id               UUID NOT NULL REFERENCES ref_districts(id) ON DELETE RESTRICT,
  area_keyword              VARCHAR(20),
  latitude                  DECIMAL(10,7),
  longitude                 DECIMAL(10,7),
  land_area                 DECIMAL(10,2),
  building_area             DECIMAL(10,2),
  bedrooms                  SMALLINT,
  bathrooms                 SMALLINT,
  floors                    SMALLINT,
  carport_capacity          SMALLINT,
  electrical_power          INT,
  water_source              TEXT CHECK (water_source IN ('pdam','sumur','lainnya')),
  furnishing                TEXT CHECK (furnishing IN ('unfurnished','semi_furnished','fully_furnished')),
  year_built                SMALLINT,
  certificate_type          TEXT CHECK (certificate_type IN ('shm','hgb','girik','ppjb','strata_title','lainnya')),
  certificate_transferred   BOOLEAN,
  imb_status                TEXT CHECK (imb_status IN ('ada','tidak_ada','dalam_proses')),
  dispute_free_declared     BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number           VARCHAR(20) NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','pending_review','published','sold','rented','expired','rejected')),
  rejection_reason          TEXT,
  view_count                INT NOT NULL DEFAULT 0,
  cta_click_count           INT NOT NULL DEFAULT 0,
  published_at              TIMESTAMPTZ,
  expired_at                TIMESTAMPTZ,
  sold_or_rented_at         TIMESTAMPTZ,
  deleted_at                TIMESTAMPTZ,  -- soft-delete (ADR-046, tabel asli)
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index prioritas pencarian (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_listings_search ON listings(status, category, transaction_type, city_id, price)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_agent ON listings(agent_id) WHERE deleted_at IS NULL;
-- Full-text + trigram search (ADR-005 Fase 1: Postgres FTS + pg_trgm)
CREATE INDEX idx_listings_fts ON listings USING GIN (to_tsvector('indonesian', title || ' ' || COALESCE(description,'')));
CREATE INDEX idx_listings_area_keyword_trgm ON listings USING GIN (area_keyword gin_trgm_ops);

CREATE TABLE listing_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(150),
  is_cover    BOOLEAN NOT NULL DEFAULT false,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  file_hash   VARCHAR(64),  -- SHA-256 hex digest, deteksi duplikat exact-match (ADR-047)
  photo_hash  VARCHAR(64)   -- perceptual hash 64-bit (image-hash), deteksi kemiripan (ADR-047)
);
CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id);
-- Index deteksi duplikat foto (ADR-047, OD-25) — mendukung query pembanding saat
-- agen submit listing untuk review, dibatasi ke listing aktif milik agent_id yang sama
CREATE INDEX idx_listing_photos_file_hash ON listing_photos(file_hash);
CREATE INDEX idx_listing_photos_photo_hash ON listing_photos(photo_hash);

CREATE TABLE listing_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('video','virtual_tour'))
);
CREATE INDEX idx_listing_videos_listing ON listing_videos(listing_id);

CREATE TABLE amenities (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE listing_amenities (
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE listing_price_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  old_price   DECIMAL(18,2),
  new_price   DECIMAL(18,2),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lph_listing ON listing_price_history(listing_id);

CREATE TABLE listing_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      TEXT NOT NULL DEFAULT 'whatsapp_cta',
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index agregasi dashboard (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_listing_leads_dashboard ON listing_leads(listing_id, created_at);
CREATE INDEX idx_listing_leads_agent ON listing_leads(agent_id, created_at);

CREATE TABLE listing_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listing_views_listing ON listing_views(listing_id);

-- Late FK: agent_reviews.listing_lead_id (ditunda dari 0005 karena listing_leads baru ada sekarang)
ALTER TABLE agent_reviews ADD CONSTRAINT fk_agent_reviews_listing_lead
  FOREIGN KEY (listing_lead_id) REFERENCES listing_leads(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- listings: publik hanya lihat published; pemilik/org member lihat semua miliknya; all-scope lihat semua
-- Publik boleh lihat published/sold/rented (mempertahankan nilai SEO — SEO Spec §1.4,
-- Functional Spec §4.3, PRD Modul 3 & 11 Business Rule; T1-02, Issue Register).
-- 'expired' TIDAK termasuk di sini — mengikuti kebijakan noindex-tapi-tetap-akses
-- terpisah (SEO Spec §1.4: noindex setelah 30 hari, bukan diblokir RLS) — belum
-- diimplementasikan, di luar scope perbaikan ini.
CREATE POLICY listings_select_public ON listings FOR SELECT TO anon, authenticated
  USING (status IN ('published','sold','rented') AND deleted_at IS NULL);
CREATE POLICY listings_select_own ON listings FOR SELECT TO authenticated
  USING (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listings_insert_own ON listings FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());
-- Hard rule: Agen hanya boleh UPDATE/DELETE listing miliknya sendiri (ERD v1.3 Bagian 4 poin 6)
CREATE POLICY listings_update_own_or_org_leader ON listings FOR UPDATE TO authenticated
  USING (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','update'))
  WITH CHECK (agent_id = auth.uid()
         OR (organization_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM organization_members om WHERE om.organization_id = listings.organization_id
                AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active'))
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY listing_photos_select ON listing_photos FOR SELECT TO anon, authenticated USING (true);
-- Org Leader (pola sama listings_update_own_or_org_leader) dapat kelola foto listing
-- anggota Organization-nya, bukan hanya pemilik asli — T1-02 pendamping (Konflik #2).
CREATE POLICY listing_photos_manage ON listing_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_photos.listing_id AND l.agent_id = auth.uid())
         OR EXISTS (SELECT 1 FROM listings l JOIN organization_members om ON om.organization_id = l.organization_id
                     WHERE l.id = listing_photos.listing_id AND l.organization_id IS NOT NULL
                       AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active')
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY listing_videos_select ON listing_videos FOR SELECT TO anon, authenticated USING (true);
-- Org Leader dapat kelola video listing anggota Organization-nya (pola sama photos).
CREATE POLICY listing_videos_manage ON listing_videos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_videos.listing_id AND l.agent_id = auth.uid())
         OR EXISTS (SELECT 1 FROM listings l JOIN organization_members om ON om.organization_id = l.organization_id
                     WHERE l.id = listing_videos.listing_id AND l.organization_id IS NOT NULL
                       AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active')
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY amenities_select ON amenities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY amenities_manage ON amenities FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

CREATE POLICY listing_amenities_select ON listing_amenities FOR SELECT TO anon, authenticated USING (true);
-- Org Leader dapat kelola amenity listing anggota Organization-nya (pola sama photos/videos).
CREATE POLICY listing_amenities_manage ON listing_amenities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_amenities.listing_id AND l.agent_id = auth.uid())
         OR EXISTS (SELECT 1 FROM listings l JOIN organization_members om ON om.organization_id = l.organization_id
                     WHERE l.id = listing_amenities.listing_id AND l.organization_id IS NOT NULL
                       AND om.agent_id = auth.uid() AND om.role = 'leader' AND om.status = 'active')
         OR auth_has_scope_all('M03_listing','update'));

CREATE POLICY lph_select_own ON listing_price_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_price_history.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','view'));

CREATE POLICY listing_leads_select_own ON listing_leads FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listing_leads_insert_public ON listing_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);  -- CTA klik dari publik, tanpa login

CREATE POLICY listing_views_select_own ON listing_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_views.listing_id AND l.agent_id = auth.uid())
         OR auth_has_scope_all('M03_listing','view'));
CREATE POLICY listing_views_insert_public ON listing_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);
