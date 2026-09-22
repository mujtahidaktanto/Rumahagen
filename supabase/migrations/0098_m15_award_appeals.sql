-- 0098_m15_award_appeals.sql
-- Gap M15 (audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md Gap #4):
-- STEP11-B8 mengunci API-230/231/232 (POST/GET /awards/{id}/appeals, POST
-- .../{appeal_id}/decide) sebagai "PRESERVE EXACT CURRENT CONTRACT" -- tapi
-- TABEL fisiknya TIDAK ADA di 14 tabel M15 manapun (title_definitions,
-- title_authority_scopes, awarding_paths/path_versions/rule_versions/
-- path_rules/condition_groups/conditions/prerequisites,
-- qualification_evidence/evaluations, award_instances,
-- award_qualifying_paths, title_presentations -- dicek satu per satu ke
-- STEP11-B8 §13, tidak ada "award_appeals"). STEP10-A1 sendiri menulis
-- "M15: Appeal/history remain process/history reuse" -- dibaca sebagai:
-- Appeal butuh baris state (untuk GET list + {appeal_id} addressable, sesuai
-- kontrak API), TAPI histori keputusannya TIDAK boleh jadi subsistem
-- audit-log duplikat sendiri (STEP11-B8 §13 physical integrity observation:
-- "Award lifecycle history reuses canonical audit_logs; no duplicate
-- appeal-history subsystem is introduced") -- log_audit_event() yang sudah
-- ada (0012) dipakai untuk histori, tabel ini HANYA state saat ini.
--
-- Tidak ada permission baru dibuat (D13-15): "decide" memakai ULANG
-- m15.award.revoke/m15.award.manage TANPA owner_id (has_permission()
-- mengembalikan FALSE untuk scope 'own' kalau p_owner_id NULL -- 0006 baris
-- 104-105 -- otomatis mengecualikan Agent, hanya Superadmin/Admin/Manager
-- yang scope-nya 'all' yang lolos), pola identik dengan
-- app/api/awards/[id]/restore/route.ts yang SUDAH memakai permission sama
-- untuk operasi authority-only ini (komentarnya sendiri: "permission yang
-- sama dipakai revoke juga dipakai restore, tidak ada permission
-- m15.award.restore terpisah di master matrix").

CREATE TABLE public.award_appeals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id       UUID NOT NULL REFERENCES public.award_instances(id) ON DELETE CASCADE,
  appellant_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  decision_note  TEXT,
  decided_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.award_appeals IS
  'ADD-NEW -- bukan entity STEP10-D (Core mengunci API-230/231/232 tapi tidak pernah mendefinisikan tabelnya). Menyimpan STATE saat ini appeal (pending/approved/rejected); histori keputusan/aksi tetap lewat audit_logs (log_audit_event(), dipanggil dari route), BUKAN kolom/tabel tambahan di sini -- menegakkan STEP11-B8 "no duplicate appeal-history subsystem".';

COMMENT ON COLUMN public.award_appeals.appellant_id IS
  'Pemilik award (API-230: "Award owner"). Ditegakkan sama dengan award_instances.user_id lewat trigger enforce_award_appeal_eligibility di bawah, bukan diasumsikan dari body request.';

-- Appeal hanya masuk akal untuk award yang SUDAH direvoke (pemilik
-- membantah keputusan revoke) -- konsisten dengan lifecycle
-- active->revoked->restored yang sudah ada (0026, lifecycle/route.ts,
-- restore/route.ts). Ditegakkan trigger (bukan CHECK constraint statis)
-- karena butuh membaca tabel lain (award_instances), pola sama seperti
-- enforce_award_requires_authority_scope (0026).
CREATE OR REPLACE FUNCTION public.enforce_award_appeal_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_award public.award_instances;
BEGIN
  SELECT * INTO v_award FROM public.award_instances WHERE id = NEW.award_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'award_appeals: award_id % tidak ditemukan', NEW.award_id;
  END IF;
  IF v_award.user_id <> NEW.appellant_id THEN
    RAISE EXCEPTION 'award_appeals: appellant_id harus pemilik award (award owner, API-230)';
  END IF;
  IF v_award.status <> 'revoked' THEN
    RAISE EXCEPTION 'award_appeals: award berstatus % -- appeal hanya bisa diajukan untuk award berstatus revoked', v_award.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_award_appeal_eligibility
  BEFORE INSERT ON public.award_appeals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_award_appeal_eligibility();

-- Satu appeal 'pending' hidup per award -- mencegah spam appeal berulang
-- selagi satu masih menunggu keputusan. Boleh appeal lagi SETELAH yang lama
-- diputuskan (approved/rejected tidak lagi dihitung "hidup").
CREATE UNIQUE INDEX award_appeals_one_pending_per_award
  ON public.award_appeals (award_id)
  WHERE status = 'pending';

-- Keputusan final -- sekali diputuskan (approved/rejected), tidak bisa
-- diubah lagi (pola sama seperti 'revoked' final di agent_ai_connections,
-- 0016). decided_at diisi otomatis oleh trigger, bukan diterima dari body
-- request (mencegah klien memalsukan waktu keputusan).
CREATE OR REPLACE FUNCTION public.enforce_award_appeal_decision_final()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'award_appeals: keputusan appeal % sudah final (status %), tidak bisa diubah lagi', OLD.id, OLD.status;
  END IF;
  IF NEW.status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'award_appeals: decide hanya boleh mengubah status ke approved/rejected';
  END IF;
  NEW.decided_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_award_appeal_decision_final
  BEFORE UPDATE OF status ON public.award_appeals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_award_appeal_decision_final();

-- ── RLS ──
ALTER TABLE public.award_appeals ENABLE ROW LEVEL SECURITY;

-- SELECT: pemilik lihat appeal miliknya sendiri, ATAU authority (Superadmin/
-- Admin/Manager, scope 'all') lihat semua -- API-231 "Owner/authority".
CREATE POLICY award_appeals_select ON public.award_appeals
  FOR SELECT USING (
    appellant_id = auth.uid()
    OR public.has_permission('m15.award.revoke')
    OR public.has_permission('m15.award.manage')
  );

-- INSERT: hanya pemilik award sendiri (API-230 "Award owner") -- kelayakan
-- (award memang revoked, appellant memang pemilik) ditegakkan trigger di
-- atas, bukan diduplikasi di sini (R-02).
CREATE POLICY award_appeals_insert ON public.award_appeals
  FOR INSERT WITH CHECK (appellant_id = auth.uid());

-- UPDATE (decide): HANYA authority (Superadmin/Admin/Manager) -- API-232
-- "Authorized authority". Sengaja TANPA owner_id (has_permission() dengan
-- p_owner_id NULL mengembalikan FALSE untuk scope 'own' -- lihat 0006 baris
-- 104-105) supaya Agent (yang scope-nya 'own' untuk kedua permission ini)
-- TIDAK BISA memutuskan appeal-nya sendiri -- mencegah kelas bug
-- self-approval yang sudah beberapa kali ditemukan & diperbaiki di proyek
-- ini sebelumnya (mis. migration 0079).
CREATE POLICY award_appeals_decide ON public.award_appeals
  FOR UPDATE USING (
    public.has_permission('m15.award.revoke')
    OR public.has_permission('m15.award.manage')
  )
  WITH CHECK (
    public.has_permission('m15.award.revoke')
    OR public.has_permission('m15.award.manage')
  );
