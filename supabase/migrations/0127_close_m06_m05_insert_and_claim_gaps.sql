-- 0127_close_m06_m05_insert_and_claim_gaps.sql
-- Menutup 3 celah RLS yang dibuktikan lewat uji rollback pada DB live (2026-09-24), ditemukan saat
-- memindai persona Developer Partner (docs/design/wireframes-v2/SOURCE-Developer-Partner.md §8):
--
--  1. Agent bisa MENYETUJUI KLAIMNYA SENDIRI. Policy agent_project_claims_review memakai
--     has_permission('m06.claim.approve'|reject|revoke|review, agent_id) dan role agent punya scope 'own'
--     untuk keempatnya, jadi agent lolos pada baris klaim miliknya. Akibatnya hard-gate
--     POST /listings/from-project (PRE-00-H §21) bisa dilewati tanpa persetujuan Developer Partner.
--     Tidak ada validasi transisi status sama sekali.
--  2. Developer Partner bisa INSERT developer_projects langsung berstatus 'active' (trigger publish-gate
--     0034 hanya BEFORE UPDATE), melewati aktivasi staf (PRE-00-H §16).
--  3. Developer Partner bisa INSERT events langsung berstatus 'published' (trigger lifecycle 0031 hanya
--     BEFORE UPDATE), melewati "subject to approval" (PRE-00-G §15).
--
-- Perbaikan hanya lewat trigger (policy RLS tidak diubah), supaya alur sah tetap sama.
-- Penggerak yang tidak punya auth.uid() (service_role/migration) tidak dibatasi.

-- ── 1. Klaim: pelaku dan transisi ──
-- Transisi sah (PRE-00-H §17): pending -> approved | rejected | withdrawn; approved -> revoked.
-- rejected, revoked, withdrawn adalah status akhir.
-- Pelaku:
--   withdrawn                  : hanya Agent pemilik klaim, lewat m06.claim.withdraw
--   approved / rejected / revoked : Developer Partner pemilik proyek (izin own) atau staf (izin scope all).
--                                   Pemilik klaim tidak boleh memutuskan klaimnya sendiri (kecuali Superadmin).
CREATE OR REPLACE FUNCTION public.enforce_project_claim_transition_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_action     TEXT;
  v_dev_user   UUID;
  v_permitted  BOOLEAN;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT ((OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected', 'withdrawn'))
       OR (OLD.status = 'approved' AND NEW.status = 'revoked')) THEN
    RAISE EXCEPTION 'agent_project_claims: transisi status % -> % tidak diizinkan (PRE-00-H §17)', OLD.status, NEW.status
      USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'withdrawn' THEN
    IF OLD.agent_id IS DISTINCT FROM auth.uid() OR NOT public.has_permission('m06.claim.withdraw', OLD.agent_id) THEN
      RAISE EXCEPTION 'agent_project_claims: hanya Agent pemilik klaim yang boleh membatalkan (withdraw) klaimnya'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  v_action := CASE NEW.status WHEN 'approved' THEN 'm06.claim.approve' WHEN 'rejected' THEN 'm06.claim.reject' ELSE 'm06.claim.revoke' END;

  IF OLD.agent_id = auth.uid() AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'agent_project_claims: pemilik klaim tidak boleh memutuskan (approve/reject/revoke) klaimnya sendiri'
      USING ERRCODE = '42501';
  END IF;

  SELECT dp.user_id INTO v_dev_user
  FROM public.developer_projects dpr JOIN public.developer_partners dp ON dp.id = dpr.developer_id
  WHERE dpr.id = OLD.project_id;

  v_permitted := public.has_permission(v_action)                                              -- staf (scope all)
              OR (v_dev_user IS NOT NULL AND v_dev_user = auth.uid() AND public.has_permission(v_action, auth.uid()));  -- Developer Partner pemilik proyek
  IF NOT v_permitted THEN
    RAISE EXCEPTION 'agent_project_claims: hanya Developer Partner pemilik proyek atau staf yang boleh mengubah status ke %', NEW.status
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_project_claim_transition_rules
  BEFORE UPDATE OF status ON public.agent_project_claims
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_claim_transition_rules();

-- ── 2. Proyek: tidak boleh dibuat langsung 'active' tanpa izin publish ──
CREATE OR REPLACE FUNCTION public.enforce_developer_project_insert_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND auth.uid() IS NOT NULL AND NOT public.has_permission('m06.developer_project.publish') THEN
    RAISE EXCEPTION 'developer_projects: membuat proyek langsung berstatus active butuh permission m06.developer_project.publish (Gate PRE-00-H §16, moderation-gated)'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_developer_project_insert_status
  BEFORE INSERT ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_developer_project_insert_status();

-- ── 3. Event: INSERT selain 'pending_approval' butuh izin publish ──
CREATE OR REPLACE FUNCTION public.enforce_event_insert_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> 'pending_approval' AND auth.uid() IS NOT NULL
     AND NOT public.has_permission('m05.event.publish', NEW.submitted_by) THEN
    RAISE EXCEPTION 'events: membuat event langsung berstatus % butuh permission m05.event.publish (Gate PRE-00-G §15, subject to approval)', NEW.status
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_event_insert_status
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_insert_status();
