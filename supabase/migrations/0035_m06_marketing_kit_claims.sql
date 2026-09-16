-- 0035_m06_marketing_kit_claims.sql
-- Menutup sisa R-05: "...Marketing Kit, dan Claim pada modul Project."
-- Permission SUDAH ADA sejak Tahap 1: m06.marketing_kit.{create,upload,edit,
-- delete,view,download}, m06.claim.{review,approve,reject,revoke}.
--
-- Sumber kolom: STEP10-D entity MARKETING_KIT/AGENT_PROJECT_CLAIMS (module
-- M06). MARKETING_KIT seluruh kolom (kecuali id/project_id) kosong di sumber
-- — diisi minimal sesuai Gate PRE-00-H §13: "Canonical content: PDF brochure,
-- PDF pricelist" — file_type dipersempit ke 2 nilai itu (BUKAN tipe dokumen
-- bebas, sesuai kunci gate "not generic document storage with unrestricted
-- document types").

CREATE TABLE IF NOT EXISTS public.marketing_kit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  file_id     TEXT,
  file_type   TEXT NOT NULL CHECK (file_type IN ('brochure','price_list')),
  file_name   VARCHAR(255) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.marketing_kit.file_type IS
  'CHECK (brochure, price_list) SAJA — bukan tipe dokumen bebas, mengikuti Gate PRE-00-H §13 "Marketing Kit is not... generic document storage with unrestricted document types".';

COMMENT ON COLUMN public.marketing_kit.file_id IS
  'Referensi eksternal ke sistem penyimpanan file (mis. storage object key) — TEXT bebas karena STEP10-D tidak memberi tipe eksplisit, dan mekanisme storage belum ditentukan di repo ini.';

CREATE TABLE IF NOT EXISTS public.agent_project_claims (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','revoked')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  claimed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, project_id)
);

COMMENT ON COLUMN public.agent_project_claims.status IS
  'ADD-NEW — STEP10-D hanya definisikan id/agent_id/project_id/claimed_at untuk entity ini, tanpa kolom status. Kolom status/reviewed_by/reviewed_at ditambahkan supaya 4 permission claim (review/approve/reject/revoke) yang sudah di-seed Tahap 1 punya sesuatu untuk digerbangi secara fisik — Gate PRE-00-H §17 "PROJECT CLAIM — SEMANTIC LIFECYCLE" mengonfirmasi memang ada lifecycle approval untuk Claim, meski kolom fisiknya belum dievidensi di STEP10-D.';

-- Trigger: siapa pun approve/reject/revoke, catat reviewer+waktu (validitas
-- data audit, bukan akses).
CREATE OR REPLACE FUNCTION public.enforce_project_claim_review_stamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'pending' THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_project_claim_review_stamp
  BEFORE UPDATE OF status ON public.agent_project_claims
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_claim_review_stamp();

-- ── RLS ──

ALTER TABLE public.marketing_kit         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_project_claims  ENABLE ROW LEVEL SECURITY;

-- marketing_kit: View/Download (Superadmin/Admin/Manager/Agent=ALL-atau-OWN,
-- Developer Partner=OWN) terpisah dari Create/Upload/Edit/Delete
-- (Superadmin/Admin/Manager=ALL, Developer Partner=OWN, Agent=NONE — Agent
-- cuma boleh lihat/unduh, tidak boleh unggah/edit).
CREATE POLICY marketing_kit_select ON public.marketing_kit
  FOR SELECT USING (
    public.has_permission('m06.marketing_kit.view', (SELECT dp.user_id FROM public.developer_partners dp JOIN public.developer_projects dpr ON dpr.developer_id = dp.id WHERE dpr.id = marketing_kit.project_id))
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager','agent')
  );

CREATE POLICY marketing_kit_manage ON public.marketing_kit
  FOR ALL USING (
    public.has_permission('m06.marketing_kit.create', (SELECT dp.user_id FROM public.developer_partners dp JOIN public.developer_projects dpr ON dpr.developer_id = dp.id WHERE dpr.id = marketing_kit.project_id))
  )
  WITH CHECK (
    public.has_permission('m06.marketing_kit.create', (SELECT dp.user_id FROM public.developer_partners dp JOIN public.developer_projects dpr ON dpr.developer_id = dp.id WHERE dpr.id = project_id))
  );

-- agent_project_claims: Agent create/view OWN, Developer Partner view OWN
-- (project miliknya diklaim siapa), Superadmin/Admin/Manager review/approve/
-- reject/revoke.
CREATE POLICY agent_project_claims_select ON public.agent_project_claims
  FOR SELECT USING (
    agent_id = auth.uid()
    OR public.has_permission('m06.claim.review', agent_id)
    OR EXISTS (
      SELECT 1 FROM public.developer_projects dpr
      JOIN public.developer_partners dp ON dp.id = dpr.developer_id
      WHERE dpr.id = agent_project_claims.project_id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY agent_project_claims_insert ON public.agent_project_claims
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY agent_project_claims_review ON public.agent_project_claims
  FOR UPDATE USING (
    public.has_permission('m06.claim.review', agent_id)
    OR public.has_permission('m06.claim.approve', agent_id)
    OR public.has_permission('m06.claim.reject', agent_id)
    OR public.has_permission('m06.claim.revoke', agent_id)
  );
