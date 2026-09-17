-- 0041_fix_agent_project_claims_review_policy.sql
-- Menutup BUG FUNGSIONAL (ditemukan saat testing REST API M06, bukan gap
-- dokumentasi): RLS `agent_project_claims_review` dari
-- 0035_m06_marketing_kit_claims.sql mengecek kepemilikan HANYA lewat
-- `agent_id` (agen pengklaim) sebagai parameter has_permission():
--
--   has_permission('m06.claim.review', agent_id) OR ... approve/reject/revoke
--
-- Padahal seed 0009 memberi scope 'own' untuk KEDUA aktor pada keempat
-- action_code ini: agent (own — untuk kasus withdraw klaim sendiri) DAN
-- developer_partner (own — untuk kasus Developer Partner me-review klaim
-- yang masuk ke project MILIKNYA). has_permission(action, p_owner_id) dengan
-- scope 'own' hanya true kalau p_owner_id = auth.uid() — karena policy lama
-- selalu mengirim `agent_id` (bukan identitas developer), Developer Partner
-- TIDAK PERNAH bisa lolos WITH CHECK ini walau secara permission dia
-- seharusnya berwenang. Dikonfirmasi lewat test nyata: Developer Partner
-- approve klaim di project miliknya sendiri → RLS menolak (0 baris ter-update).
--
-- PERBAIKAN: tambahkan klausul OR yang mengecek kepemilikan Developer
-- Partner lewat rantai project_id -> developer_projects.developer_id ->
-- developer_partners.user_id — pola subquery JOIN yang SAMA persis dipakai
-- marketing_kit_select/marketing_kit_manage (0035) untuk kasus serupa.
-- Klausul agent_id lama TETAP dipertahankan (agent masih bisa withdraw klaim
-- sendiri lewat action code yang sama, sesuai desain awal).

DROP POLICY IF EXISTS agent_project_claims_review ON public.agent_project_claims;

CREATE POLICY agent_project_claims_review ON public.agent_project_claims
  FOR UPDATE USING (
    public.has_permission('m06.claim.review', agent_id)
    OR public.has_permission('m06.claim.approve', agent_id)
    OR public.has_permission('m06.claim.reject', agent_id)
    OR public.has_permission('m06.claim.revoke', agent_id)
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
