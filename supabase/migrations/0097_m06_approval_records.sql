-- 0097_m06_approval_records.sql
-- M06 physical realization of the locked Approval Claim / Approval Record artifact.
-- Approval Record is an immutable consequence of an approved project claim.
-- No human "Generate" permission is introduced; generation is performed by the
-- application as a consequence of approval and is retriable if storage fails.

CREATE TABLE IF NOT EXISTS public.approval_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL UNIQUE REFERENCES public.agent_project_claims(id) ON DELETE RESTRICT,
  version INT NOT NULL DEFAULT 1 CHECK (version = 1),
  artifact_path TEXT NOT NULL UNIQUE,
  artifact_sha256 VARCHAR(64) NOT NULL CHECK (artifact_sha256 ~ '^[0-9a-f]{64}$'),
  mime_type TEXT NOT NULL DEFAULT 'application/pdf' CHECK (mime_type = 'application/pdf'),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.approval_records IS
  'M06 Approval Record: immutable evidence artifact generated automatically as a consequence of Claim approval. Private PDF stored in Supabase Storage; SHA-256 binds the DB record to the exact bytes.';

ALTER TABLE public.approval_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY approval_records_select ON public.approval_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agent_project_claims c
      WHERE c.id = approval_records.claim_id
        AND (
          c.agent_id = auth.uid()
          OR public.has_permission('m06.claim.review', c.agent_id)
          OR EXISTS (
            SELECT 1
            FROM public.developer_projects dpr
            JOIN public.developer_partners dp ON dp.id = dpr.developer_id
            WHERE dpr.id = c.project_id AND dp.user_id = auth.uid()
          )
        )
    )
  );

-- No client INSERT/UPDATE/DELETE policy. Artifact mutation is server-side only.
-- Defense-in-depth: even a privileged DB client cannot mutate/delete a completed artifact record.
CREATE OR REPLACE FUNCTION public.prevent_approval_record_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  RAISE EXCEPTION 'approval_records is immutable';
END;
$;

CREATE TRIGGER trg_approval_records_immutable
  BEFORE UPDATE OR DELETE ON public.approval_records
  FOR EACH ROW EXECUTE FUNCTION public.prevent_approval_record_mutation();
INSERT INTO storage.buckets (id, name, public)
VALUES ('approval-records', 'approval-records', false)
ON CONFLICT (id) DO UPDATE SET public = false;
