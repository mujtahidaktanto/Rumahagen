-- 0034_m06_developer_projects.sql
-- Menutup bagian inti R-05: "Implementasikan penyimpanan fisik untuk field
-- Developer... pada modul Project."
--
-- Sumber kolom: STEP10-D entity DEVELOPER_PROJECTS/DEVELOPER_PROJECT_MEDIA
-- (module M06). DEVELOPER_PROJECTS punya 24 kolom gap kosong — SEMUANYA
-- adalah field detail properti yang PERSIS SAMA dengan listings (0018): 
-- province_id/district_id/bedrooms/bathrooms/land_area/building_area/floors/
-- carport_capacity/electrical_power/water_source/furnishing/year_built/
-- certificate_type/imb_status/category/transaction_type/price_unit/
-- is_negotiable/area_keyword/latitude/longitude/certificate_transferred/
-- dispute_free_declared/extra_commission — diisi dengan TIPE DAN CONSTRAINT
-- YANG SAMA seperti listings, bukan didesain ulang dari nol (Gate PRE-00-H §9
-- "M06 ↔ M03 FIELD-NAME RECONCILIATION" mengonfirmasi field-field ini memang
-- dimaksudkan selaras dengan Listing).
--
-- CATATAN PERMISSION: tidak ada baris matrix "Developer Project" murni (sama
-- seperti developer_partners/0033) — dipakai m06.developer_partner.manage yang
-- sudah ada untuk Create/Edit staf, PLUS 1 permission baru untuk Developer
-- Partner mengelola project miliknya sendiri (scope OWN, meniru pola persis
-- Marketing Kit Create di master matrix — "Developer Partner own developer/
-- project scope" adalah frasa yang SAMA dipakai di baris Marketing Kit):
--   m06.developer_project.manage → Superadmin/Admin/Manager=ALL, Developer Partner=OWN
--   m06.developer_project.publish → Superadmin/Admin/Manager=ALL SAJA (Gate §16: "Publish/Activate is moderation-gated", Developer Partner=NONE — Project Update ≠ Publish/Activate)

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m06', 'm06.developer_project.manage', 'own', 'Developer Project - Manage/Create/Edit (permission baru, meniru pola scope Marketing Kit Create yang sudah dievidensi — "Developer Partner own developer/project scope")'),
  ('m06', 'm06.developer_project.publish', 'own', 'Developer Project - Publish/Activate (Gate PRE-00-H §16, permission baru, moderation-gated — Developer Partner TIDAK dapat scope ini sama sekali)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin',        'm06.developer_project.manage', 'all'),
  ('admin',              'm06.developer_project.manage', 'all'),
  ('manager',            'm06.developer_project.manage', 'all'),
  ('developer_partner',  'm06.developer_project.manage', 'own'),
  ('superadmin', 'm06.developer_project.publish', 'all'),
  ('admin',      'm06.developer_project.publish', 'all'),
  ('manager',    'm06.developer_project.publish', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.developer_projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id              UUID NOT NULL REFERENCES public.developer_partners(id) ON DELETE CASCADE,
  name                      VARCHAR(200) NOT NULL,
  slug                      VARCHAR(220) UNIQUE NOT NULL,
  meta_title                VARCHAR(70),
  meta_description          VARCHAR(160),
  category                  TEXT NOT NULL CHECK (category IN ('primary','secondary')),
  transaction_type          TEXT NOT NULL CHECK (transaction_type IN ('sale','rent')),
  property_type             TEXT CHECK (property_type IN ('rumah','apartemen','ruko','tanah','gudang','kavling','lainnya')),
  location                  VARCHAR(255),
  province_id               UUID NOT NULL REFERENCES public.ref_provinces(id) ON DELETE RESTRICT,
  city_id                   UUID NOT NULL REFERENCES public.ref_cities(id) ON DELETE RESTRICT,
  district_id               UUID NOT NULL REFERENCES public.ref_districts(id) ON DELETE RESTRICT,
  area_keyword              VARCHAR(20),
  latitude                  DECIMAL(10,7),
  longitude                 DECIMAL(10,7),
  price_min                 DECIMAL(18,2),
  price_max                 DECIMAL(18,2),
  price_unit                TEXT CHECK (price_unit IN ('total','per_bulan','per_tahun')),
  is_negotiable             BOOLEAN NOT NULL DEFAULT false,
  unit_availability         INT,
  bedrooms                  SMALLINT,
  bathrooms                 SMALLINT,
  land_area                 DECIMAL(10,2),
  building_area             DECIMAL(10,2),
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
  commission_scheme         VARCHAR(255),
  extra_commission          TEXT,
  is_exclusive_by_region    BOOLEAN NOT NULL DEFAULT false,
  status                    TEXT NOT NULL DEFAULT 'coming_soon'
                               CHECK (status IN ('active','coming_soon','sold_out','inactive')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.developer_projects IS
  'Sumber: STEP10-D entity DEVELOPER_PROJECTS. 24 kolom detail properti (province_id s.d. dispute_free_declared) diisi TYPE/CONSTRAINT identik dengan listings (0018) — lihat rasional lengkap di atas migration ini. `extra_commission` sengaja TEXT bebas (bukan DECIMAL) — STEP10-D tidak memberi logical_data_type eksplisit untuk kolom ini, beda dari kolom numerik lain yang jelas typenya.';

CREATE TABLE IF NOT EXISTS public.developer_project_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('photo','video')),
  url         VARCHAR(500) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.developer_project_media.type IS
  'CHECK dipersempit ke (photo,video) — BEDA dari STEP10-D literal yang mengizinkan (photo,video,brochure,price_list). Ini deviasi TERDOKUMENTASI mengikuti Gate PRE-00-H §12 "PROJECT MEDIA vs MARKETING KIT CONFLICT": brochure/price_list secara semantik adalah Marketing Kit (0035), BUKAN Project Media — gate mengklasifikasikan ini RECONCILE/CONTROLLED, keputusan gate diikuti di sini (pola sama seperti agent_reviews.status default di 0030).';

-- ── FK RETROAKTIF: menutup 2 loose-reference yang ditunda sejak Tahap 4/5 ──
-- (TODO eksplisit yang didokumentasikan di 0018/0031, sekarang ditutup karena
-- developer_projects akhirnya ada).
ALTER TABLE public.listings
  ADD CONSTRAINT listings_developer_project_id_fkey
  FOREIGN KEY (developer_project_id) REFERENCES public.developer_projects(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD CONSTRAINT events_related_project_id_fkey
  FOREIGN KEY (related_project_id) REFERENCES public.developer_projects(id) ON DELETE SET NULL;

-- ── RLS ──

ALTER TABLE public.developer_projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_project_media  ENABLE ROW LEVEL SECURITY;

CREATE POLICY developer_projects_select ON public.developer_projects
  FOR SELECT USING (
    (status IN ('active','coming_soon','sold_out') AND EXISTS (
      SELECT 1 FROM public.developer_partners dp WHERE dp.id = developer_projects.developer_id AND dp.status = 'active'
    ))
    OR public.has_permission('m06.developer_project.manage', (SELECT dp.user_id FROM public.developer_partners dp WHERE dp.id = developer_projects.developer_id))
  );

CREATE POLICY developer_projects_insert ON public.developer_projects
  FOR INSERT WITH CHECK (
    public.has_permission('m06.developer_project.manage', (SELECT dp.user_id FROM public.developer_partners dp WHERE dp.id = developer_id))
  );

CREATE POLICY developer_projects_update ON public.developer_projects
  FOR UPDATE USING (
    public.has_permission('m06.developer_project.manage', (SELECT dp.user_id FROM public.developer_partners dp WHERE dp.id = developer_projects.developer_id))
  );

-- Publish/Activate (Update.status → 'active') digerbangi terpisah lewat
-- trigger — Gate §16: "Project Update ≠ Project Publish/Activate".
CREATE OR REPLACE FUNCTION public.enforce_developer_project_publish_permission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status <> 'active' THEN
    IF NOT public.has_permission('m06.developer_project.publish') THEN
      RAISE EXCEPTION 'developer_projects: transisi ke active (publish) butuh permission m06.developer_project.publish (Gate PRE-00-H §16, moderation-gated)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_developer_project_publish_permission
  BEFORE UPDATE ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_developer_project_publish_permission();

CREATE POLICY developer_project_media_select ON public.developer_project_media
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.developer_projects dpr
      WHERE dpr.id = developer_project_media.project_id
        AND dpr.status IN ('active','coming_soon','sold_out')
    )
    OR EXISTS (
      SELECT 1 FROM public.developer_projects dpr
      JOIN public.developer_partners dp ON dp.id = dpr.developer_id
      WHERE dpr.id = developer_project_media.project_id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY developer_project_media_manage ON public.developer_project_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.developer_projects dpr
      WHERE dpr.id = developer_project_media.project_id
        AND public.has_permission('m06.developer_project.manage', (SELECT dp.user_id FROM public.developer_partners dp WHERE dp.id = dpr.developer_id))
    )
  );
