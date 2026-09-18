-- 0085_add_agent_project_claim_withdrawn_status.sql
-- Menutup temuan Tier 1 ke-4 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-H_M06_DEVELOPER_PROJECT_
-- MARKETING_CLAIM_GATE_FULL_v1.1.md` §17-18/§46/§51 mengunci siklus klaim
-- proyek 5-state: PENDING -> APPROVED -> REVOKED, PENDING -> REJECTED, DAN
-- PENDING -> WITHDRAWN (Agent boleh menarik klaim miliknya sendiri yang
-- masih pending) -- WITHDRAWN adalah transisi TERPISAH dari REVOKED
-- (REVOKED mencabut klaim yang SUDAH disetujui, keputusan staf/Developer
-- Partner; WITHDRAWN membatalkan klaim SEBELUM diputuskan, keputusan
-- Agent sendiri).
--
-- Migration 0035 (seed Fase 1) hanya punya 4 state
-- ('pending','approved','rejected','revoked') dan 4 permission
-- (review/approve/reject/revoke, semua 'own' untuk Agent MAUPUN Developer
-- Partner) -- tidak ada permission/state khusus withdraw, jadi RLS
-- `agent_project_claims_review` (diperbaiki sekali di 0041 untuk bug lain)
-- diam-diam mengandalkan 'revoke' dobel-fungsi untuk kedua kasus. Ini BUG
-- FUNGSIONAL nyata, bukan cuma gap dokumentasi: kalau ada jalur UI/API yang
-- coba set status='withdrawn' (mengikuti kontrak Core), akan GAGAL di
-- CHECK constraint database.

ALTER TABLE public.agent_project_claims DROP CONSTRAINT agent_project_claims_status_check;
ALTER TABLE public.agent_project_claims ADD CONSTRAINT agent_project_claims_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'withdrawn'));

-- Permission BARU, HANYA untuk Agent (bukan Developer Partner -- withdraw
-- adalah aksi self-service pemilik klaim sendiri, beda dari revoke yang
-- juga bisa dilakukan pihak berwenang lain).
INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m06', 'm06.claim.withdraw', 'own', 'Claim - Withdraw (ADD-NEW/0085; Gate PRE-00-H mengunci PENDING -> WITHDRAWN sebagai transisi terpisah dari REVOKED -- Agent membatalkan klaim sendiri yang masih pending, beda dari revoke yang mencabut klaim yang SUDAH disetujui oleh staf/Developer Partner)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'own', 'superadmin'
FROM public.roles r, public.permissions p
WHERE r.code = 'agent' AND p.action_code = 'm06.claim.withdraw'
ON CONFLICT (role_id, permission_id) DO NOTHING;

DROP POLICY IF EXISTS agent_project_claims_review ON public.agent_project_claims;

CREATE POLICY agent_project_claims_review ON public.agent_project_claims
  FOR UPDATE USING (
    public.has_permission('m06.claim.review', agent_id)
    OR public.has_permission('m06.claim.approve', agent_id)
    OR public.has_permission('m06.claim.reject', agent_id)
    OR public.has_permission('m06.claim.revoke', agent_id)
    OR public.has_permission('m06.claim.withdraw', agent_id)
    OR public.has_permission('m06.claim.review', (
        SELECT dp.user_id FROM public.developer_projects dpr
        JOIN public.developer_partners dp ON dp.id = dpr.developer_id
        WHERE dpr.id = agent_project_claims.project_id
      ))
    OR public.has_permission('m06.claim.approve', (
        SELECT dp.user_id FROM public.developer_projects dpr
        JOIN public.developer_partners dp ON dp.id = dpr.developer_id
        WHERE dpr.id = agent_project_claims.project_id
      ))
    OR public.has_permission('m06.claim.reject', (
        SELECT dp.user_id FROM public.developer_projects dpr
        JOIN public.developer_partners dp ON dp.id = dpr.developer_id
        WHERE dpr.id = agent_project_claims.project_id
      ))
    OR public.has_permission('m06.claim.revoke', (
        SELECT dp.user_id FROM public.developer_projects dpr
        JOIN public.developer_partners dp ON dp.id = dpr.developer_id
        WHERE dpr.id = agent_project_claims.project_id
      ))
  );

COMMENT ON COLUMN public.agent_project_claims.status IS
  'ADD-NEW — STEP10-D hanya definisikan id/agent_id/project_id/claimed_at untuk entity ini, tanpa kolom status. DIPERLUAS 0085: menambah nilai ''withdrawn'' (transisi PENDING->WITHDRAWN, self-service Agent) terpisah dari ''revoked'' (mencabut klaim yang sudah disetujui) -- Gate PRE-00-H mengunci keduanya sebagai transisi berbeda, sebelumnya cuma ''revoked'' yang ada secara fisik.';
