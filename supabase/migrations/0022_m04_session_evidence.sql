-- 0022_m04_session_evidence.sql
-- Menutup bagian INTI residual R-08: "permission/RLS fisik untuk M04
-- (Session/Evidence)" — realisasi fisik untuk permission
-- m04.artifact.{view,manage}, m04.session_evidence.{view,manage},
-- m04.attendance.manage, m04.completion.manage (sudah di-seed Tahap 1).
--
-- Sumber kolom: STEP10-D, entity SESSION_ARTIFACTS/SESSION_PARTICIPATION_EVIDENCE/
-- SESSION_ATTENDANCE_EVALUATIONS/SESSION_COMPLETION_OUTCOMES (module M04) —
-- PRESERVE_EXACT_PHYSICAL_CORROBORATION.
--
-- KEPUTUSAN PENTING untuk D13-03 (dibaca lagi di 0027): rantai 4 tabel ini
-- punya pola field KONSISTEN yang jadi acuan "keseragaman field-level" yang
-- diminta D13-03 — setiap tahap evaluasi punya `*_policy_version` (versi
-- kebijakan yang dipakai saat evaluasi) + `result` (TEXT bebas, bukan enum
-- terkunci di STEP10-D) + timestamp `evaluated_at`/`completed_at`. Pola field
-- yang SAMA PERSIS dipakai lagi di QUALIFICATION_EVALUATIONS (0026) — itulah
-- realisasi fisik "keseragaman kontrak field" yang diminta D13-03.

CREATE TABLE IF NOT EXISTS public.session_artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  provider_key  TEXT,
  source_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('pending','available','unavailable','expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.session_artifacts IS
  'Sumber: STEP10-D entity SESSION_ARTIFACTS. Rekaman/artifact sesi (mis. recording Zoom) — Gate §38: "Existing View-SessionArtifact retained, No new permission" — memakai m04.artifact.view/manage yang sudah ada.';

CREATE TABLE IF NOT EXISTS public.session_participation_evidence (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_id             UUID NOT NULL REFERENCES public.session_provider_bindings(id) ON DELETE CASCADE,
  session_enrollment_id  UUID REFERENCES public.session_enrollments(id) ON DELETE SET NULL,
  external_event_id      TEXT,
  idempotency_key        TEXT NOT NULL UNIQUE,
  observed_at            TIMESTAMPTZ,
  received_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at           TIMESTAMPTZ,
  payload_metadata       JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.session_participation_evidence IS
  'Sumber: STEP10-D entity SESSION_PARTICIPATION_EVIDENCE. Event mentah dari provider teknis (mis. webhook "user joined" dari Zoom) — append-only (tidak ada UPDATE/DELETE policy, lihat RLS). `idempotency_key` mencegah webhook yang di-retry provider tercatat dobel.';

CREATE TABLE IF NOT EXISTS public.session_attendance_evaluations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_enrollment_id   UUID NOT NULL REFERENCES public.session_enrollments(id) ON DELETE CASCADE,
  evidence_id             UUID REFERENCES public.session_participation_evidence(id) ON DELETE SET NULL,
  policy_version          TEXT NOT NULL,
  result                  TEXT NOT NULL,
  evaluated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.session_attendance_evaluations IS
  'Sumber: STEP10-D entity SESSION_ATTENDANCE_EVALUATIONS. `result` sengaja TEXT bebas (bukan CHECK enum) — STEP10-D tidak mengunci daftar nilai attendance result (beda dengan session_enrollments.status yang eksplisit terkunci); `policy_version` menyimpan versi kebijakan evaluasi yang dipakai, supaya baris lama tetap bisa ditelusuri meski kebijakan berubah nanti.';

CREATE TABLE IF NOT EXISTS public.session_completion_outcomes (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_enrollment_id       UUID NOT NULL REFERENCES public.session_enrollments(id) ON DELETE CASCADE,
  attendance_evaluation_id    UUID REFERENCES public.session_attendance_evaluations(id) ON DELETE SET NULL,
  completion_policy_version   TEXT NOT NULL,
  result                      TEXT NOT NULL,
  completed_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.session_completion_outcomes IS
  'Sumber: STEP10-D entity SESSION_COMPLETION_OUTCOMES. Gate §33/§36 KUNCI PENTING: Session Completion TIDAK LANGSUNG memberi LP/Skill/Credential/Award — baris di sini hanya MENANDAI hasil (qualifying atau tidak), Learning Economy reward logic (0023/0025) dan M15 Qualification (0026/0027) yang memutuskan konsekuensinya, bukan tabel ini sendiri.';

-- ── Trigger: menegakkan urutan evidence→attendance→completion (bukan RLS,
-- ini soal validitas data — pola sama seperti 0004/0016) ──
-- session_completion_outcomes tidak boleh dibuat untuk enrollment yang belum
-- 'active' (Gate §33: completion mengandaikan partisipasi nyata, bukan sekadar
-- pendaftaran).
CREATE OR REPLACE FUNCTION public.enforce_completion_requires_active_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.session_enrollments
    WHERE id = NEW.session_enrollment_id AND status IN ('active','completed')
  ) THEN
    RAISE EXCEPTION 'session_completion_outcomes: session_enrollment_id % belum berstatus active/completed', NEW.session_enrollment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_completion_requires_active_enrollment
  BEFORE INSERT ON public.session_completion_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_completion_requires_active_enrollment();

-- ── RLS ── permission SUDAH ADA sejak Tahap 1. Tidak ada permission baru.

ALTER TABLE public.session_artifacts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participation_evidence   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance_evaluations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_completion_outcomes      ENABLE ROW LEVEL SECURITY;

-- session_artifacts: view via keanggotaan session (owner atau enrolled),
-- manage via permission eksplisit.
CREATE POLICY session_artifacts_select ON public.session_artifacts
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.learning_sessions ls
      WHERE ls.id = session_artifacts.session_id
        AND (ls.owner_id = auth.uid()
             OR EXISTS (SELECT 1 FROM public.session_enrollments se WHERE se.session_id = ls.id AND se.agent_id = auth.uid()))
    )
    AND public.has_permission('m04.artifact.view', auth.uid())
  );

CREATE POLICY session_artifacts_manage ON public.session_artifacts
  FOR ALL USING (public.has_permission('m04.artifact.manage'))
  WITH CHECK (public.has_permission('m04.artifact.manage'));

-- session_participation_evidence: APPEND-ONLY, tidak ada UPDATE/DELETE policy
-- sama sekali (pola sama seperti audit_logs/0012, quota_usage/0019) — event
-- webhook dari provider tidak boleh dimanipulasi setelah tercatat.
CREATE POLICY session_participation_evidence_select ON public.session_participation_evidence
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.session_enrollments se
      WHERE se.id = session_participation_evidence.session_enrollment_id
        AND public.has_permission('m04.session_evidence.view', se.agent_id)
    )
  );

CREATE POLICY session_participation_evidence_insert ON public.session_participation_evidence
  FOR INSERT WITH CHECK (public.has_permission('m04.session_evidence.manage'));

-- session_attendance_evaluations & session_completion_outcomes: view via OWN
-- (agent lihat evaluasi dirinya sendiri lewat enrollment), manage via
-- attendance.manage/completion.manage (Superadmin/Admin/Manager/Instructor
-- OWN-resource, TIDAK PERNAH Agent — Gate §33: "Agent = NONE... Learner
-- cannot authoritatively mutate completion outcome").
CREATE POLICY session_attendance_evaluations_select ON public.session_attendance_evaluations
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.session_enrollments se
      WHERE se.id = session_attendance_evaluations.session_enrollment_id AND se.agent_id = auth.uid()
    )
  );

CREATE POLICY session_attendance_evaluations_manage ON public.session_attendance_evaluations
  FOR ALL USING (public.has_permission('m04.attendance.manage'))
  WITH CHECK (public.has_permission('m04.attendance.manage'));

CREATE POLICY session_completion_outcomes_select ON public.session_completion_outcomes
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.session_enrollments se
      WHERE se.id = session_completion_outcomes.session_enrollment_id AND se.agent_id = auth.uid()
    )
  );

CREATE POLICY session_completion_outcomes_manage ON public.session_completion_outcomes
  FOR ALL USING (public.has_permission('m04.completion.manage'))
  WITH CHECK (public.has_permission('m04.completion.manage'));
