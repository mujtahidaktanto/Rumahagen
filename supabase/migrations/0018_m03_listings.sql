-- 0018_m03_listings.sql
-- Prasyarat fisik untuk residual Tahap 4 (R-04/D13-01) — tabel Listings itu sendiri
-- belum pernah dibuat di migration manapun sebelumnya. Bukan salah satu dari 2
-- residual inti Tahap 4, tapi tanpa tabel ini R-04 (Refresh Allowance) dan D13-01
-- (invocation M14→M03) tidak punya tempat berpijak — keduanya secara eksplisit
-- soal Listing Refresh action.
--
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- LISTINGS (module M03) — seluruh kolom PRESERVE_EXACT_PHYSICAL_CORROBORATION,
-- KECUALI `last_refreshed_at` yang di dokumen sumber logical_data_type-nya
-- TIMESTAMPTZ tapi sql_physical_definition-nya KOSONG (CONTROLLED_PHYSICAL_DELTA,
-- "exact physical execution remains downstream") — migration inilah "downstream"
-- yang dimaksud; diisi TIMESTAMPTZ NULLABLE persis sesuai logical_data_type &
-- logical_data_meaning-nya di dokumen ("NULLABLE; listing freshness field;
-- updated by successful Refresh").
--
-- Sumber aturan bisnis: docs/core/current/00-governance/STEP-00/
-- PRE-00-E_M03_LISTING_REFRESH_GATE_FULL_v1.1.md (gate khusus M03 Listing/Refresh,
-- status PASS/LOCKED) — dirujuk berulang di komentar bawah sebagai "Gate PRE-00-E".

CREATE TABLE IF NOT EXISTS public.listings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  developer_project_id      UUID,  -- FK ke developer_projects DITUNDA, lihat catatan di bawah
  organization_id           UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
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
  province_id               UUID NOT NULL REFERENCES public.ref_provinces(id) ON DELETE RESTRICT,
  city_id                   UUID NOT NULL REFERENCES public.ref_cities(id) ON DELETE RESTRICT,
  district_id               UUID NOT NULL REFERENCES public.ref_districts(id) ON DELETE RESTRICT,
  area_keyword              VARCHAR(20),
  latitude                  DECIMAL(10,7),  -- OPTIONAL, lihat Gate PRE-00-E §21.1 — tidak wajib diisi, tidak menghalangi publish
  longitude                 DECIMAL(10,7),  -- OPTIONAL, pasangan dengan latitude — lihat komentar yang sama
  land_area                 DECIMAL(10,2),
  building_area              DECIMAL(10,2),
  bedrooms                  SMALLINT,
  bathrooms                 SMALLINT,
  floors                    SMALLINT,
  carport_capacity          SMALLINT,
  electrical_power          INT,
  water_source               TEXT CHECK (water_source IN ('pdam','sumur','lainnya')),
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
  published_at              TIMESTAMPTZ,  -- diisi HANYA saat publish PERTAMA KALI, lihat trigger di bawah — tidak pernah dikosongkan lagi (Gate §13)
  expired_at                TIMESTAMPTZ,
  sold_or_rented_at         TIMESTAMPTZ,
  last_refreshed_at         TIMESTAMPTZ,  -- ADD-NEW/downstream (lihat catatan atas) — hanya diubah lewat refresh_listing() di 0020
  deleted_at                TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listings IS
  'Sumber: STEP10-D entity LISTINGS. Alur publikasi normal DRAFT→PUBLISH→PUBLISHED TANPA gate Pending Review (Gate PRE-00-E §6-9, me-RECONCILE konflik dengan wording Core lama) — nilai pending_review/rejected TETAP ada di CHECK constraint (tidak dihapus global, Gate §9) untuk dipakai domain otoritatif lain di masa depan, tapi alur normal M03 tidak pernah mampir ke situ.';

COMMENT ON COLUMN public.listings.developer_project_id IS
  'FK ke developer_projects SENGAJA TIDAK dipasang — tabel developer_projects adalah milik M06 (41 kolom, residual R-05 tersendiri di Tahap 6), di luar scope Tahap 4. Pola sama seperti campaign_reference di 0014: referensi longgar dulu, FK dipasang lewat ALTER TABLE saat migration M06 dibuat. Kolom tetap ada supaya bentuk skema tidak berubah nanti.';

COMMENT ON COLUMN public.listings.published_at IS
  'Sekali terisi, TIDAK PERNAH di-NULL-kan lagi meski status berubah (mis. EXPIRED→DRAFT) — menandai "pernah publish minimal sekali", dasar penguncian 4 field identitas properti (Gate §13). Trigger di bawah menegakkan ini secara fisik.';

-- ── Trigger: publish gate + post-publish field lock + guard refresh langsung ──
-- Menutup 3 aturan terkunci dari Gate PRE-00-E sekaligus:
--   1. §6-9  — transisi ke 'published' butuh permission m03.listing.publish (BUKAN
--              sekadar m03.listing.update — dua permission beda scope di matrix,
--              RLS saja tidak bisa membedakan berdasarkan NILAI kolom yang berubah).
--   2. §13   — address/property_type/land_area/building_area terkunci permanen
--              setelah publish pertama (published_at IS NOT NULL).
--   3. §26/§33 — last_refreshed_at HANYA boleh berubah lewat refresh_listing()
--              (0020), bukan UPDATE langsung dari client — supaya kuota M14 tidak
--              bisa dilewati dengan UPDATE mentah ke listings (menegakkan R-04:
--              "M03 memanggil M14, bukan menyimpan counter sendiri" — counter
--              refresh HANYA valid kalau melalui jalur yang benar-benar memanggil M14).
CREATE OR REPLACE FUNCTION public.enforce_listing_lifecycle_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- (0) Kepemilikan listing tidak boleh berpindah lewat UPDATE biasa — RLS WITH
  -- CHECK tidak bisa membandingkan ke OLD, jadi pengecekan ini ditaruh di sini.
  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
    RAISE EXCEPTION 'listings: agent_id (kepemilikan) tidak boleh diubah lewat UPDATE';
  END IF;

  -- (1) Transisi ke published butuh permission publish yang benar.
  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    IF NOT public.has_permission('m03.listing.publish', OLD.agent_id) THEN
      RAISE EXCEPTION 'listings: transisi ke published butuh permission m03.listing.publish (Gate PRE-00-E §6-9)';
    END IF;
    IF OLD.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;

  -- (2) Penguncian 4 field identitas properti setelah publish pertama.
  IF OLD.published_at IS NOT NULL THEN
    IF NEW.address IS DISTINCT FROM OLD.address
       OR NEW.property_type IS DISTINCT FROM OLD.property_type
       OR NEW.land_area IS DISTINCT FROM OLD.land_area
       OR NEW.building_area IS DISTINCT FROM OLD.building_area
    THEN
      RAISE EXCEPTION 'listings: address/property_type/land_area/building_area terkunci permanen setelah publish pertama (Gate PRE-00-E §13)';
    END IF;
  END IF;

  -- (3) last_refreshed_at hanya boleh berubah dari dalam refresh_listing() (0020),
  -- yang menandai transaksi lewat set_config('rumahagen.refresh_in_progress', ...).
  IF NEW.last_refreshed_at IS DISTINCT FROM OLD.last_refreshed_at THEN
    IF current_setting('rumahagen.refresh_in_progress', true) IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'listings: last_refreshed_at hanya boleh diubah lewat refresh_listing() (R-04) — UPDATE langsung ke kolom ini ditolak';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- TIDAK SECURITY DEFINER — sama seperti trigger 0016, hanya memanggil
-- has_permission() yang privilege-nya sendiri sudah DEFINER di 0006.

CREATE TRIGGER trg_listing_lifecycle_rules
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_lifecycle_rules();

-- ── RLS ── sumber: STEP12-01 baris M03 Listing (Create/Update/Delete/Publish/
-- Refresh) — 5 permission code SUDAH ADA di seed 0009 sejak Tahap 1. Refresh
-- SENGAJA tidak dapat RLS UPDATE tersendiri di sini — refresh_listing() (0020)
-- adalah SECURITY DEFINER dan melakukan pengecekan permission-nya sendiri lewat
-- has_permission('m03.listing.refresh', ...) sebelum UPDATE, sama seperti pola
-- admin_force_provider_connection() di 0016.

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- SELECT — tidak ada permission code "View" untuk Listing di master matrix
-- (marketplace publik: listing PUBLISHED memang harus terlihat siapa pun,
-- termasuk pengunjung anonim, itulah fungsi utama platform ini). Pemilik dan
-- Superadmin/Admin/Manager (yang punya scope ALL di Create/Delete/Publish untuk
-- keperluan moderasi) tetap bisa lihat baris apa pun statusnya.
CREATE POLICY listings_select_published_or_owner_or_staff ON public.listings
  FOR SELECT USING (
    status = 'published'
    OR agent_id = auth.uid()
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
  );

CREATE POLICY listings_insert ON public.listings
  FOR INSERT WITH CHECK (public.has_permission('m03.listing.create', agent_id));

-- UPDATE ordinary (BUKAN publish, BUKAN refresh — dua hal itu masing-masing
-- ditegakkan trigger dan fungsi terpisah di atas/0020): m03.listing.update hanya
-- Superadmin=ALL & Agent=OWN (Admin/Manager=NONE untuk edit ordinary — sesuai
-- Gate §12 "No generic role status should be interpreted as automatic Listing
-- ownership", dan matrix memang membedakan Update dari Create/Delete/Publish).
CREATE POLICY listings_update ON public.listings
  FOR UPDATE USING (public.has_permission('m03.listing.update', agent_id));

CREATE POLICY listings_delete ON public.listings
  FOR DELETE USING (public.has_permission('m03.listing.delete', agent_id));
