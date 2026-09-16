-- 0021_m04_learning_sessions.sql
-- Prasyarat fisik untuk residual Tahap 5 (R-08 bagian "Session") — realisasi
-- fisik pertama untuk 4 dari 14 permission Session yang sudah di-seed sejak
-- Tahap 1: m04.learning_session.{create,view,update,delete,manage},
-- m04.session_enrollment.{create,view}, m04.session_assignment.assign,
-- m04.learning_provider.manage.
--
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, entity
-- LEARNING_SESSIONS/LEARNING_SESSION_ASSIGNMENTS/SESSION_ENROLLMENTS/
-- SESSION_PROVIDER_BINDINGS (module M04) — PRESERVE_EXACT_PHYSICAL_CORROBORATION,
-- tanpa deviasi tipe data.
--
-- Sumber aturan bisnis: docs/core/current/00-governance/STEP-00/
-- PRE-00-F_M04_LEARNING_GATE_FULL_v1.1.md ("Gate PRE-00-F" di komentar bawah) —
-- terutama §22-31 (semantic boundary Session s.d. Provider) dan §29/§42-43
-- (Host/Instructor = resource capability, BUKAN platform role kedelapan —
-- ditegakkan fisik lewat kolom `capability` CHECK di LEARNING_SESSION_ASSIGNMENTS,
-- bukan kolom role baru di manapun).

CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  course_id        UUID,  -- FK ke courses DITUNDA — courses (M04 Learning Catalog) di luar scope Tahap 5 (R-08 hanya sebut "Session/Evidence", bukan Catalog/Activity — lihat STEP11-B4 vs B5, dua paket API terpisah)
  organization_id  UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_id         UUID,  -- FK ke events DITUNDA — milik M05, belum ada residual/migration
  session_type     TEXT NOT NULL CHECK (session_type IN ('broadcast','interactive','on_demand')),
  status           TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','scheduled','live','ended','cancelled','failed')),
  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ,
  visibility       TEXT NOT NULL DEFAULT 'private'
                      CHECK (visibility IN ('public','organization','partner','private')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

COMMENT ON TABLE public.learning_sessions IS
  'Sumber: STEP10-D entity LEARNING_SESSIONS. `visibility` MENENTUKAN SIAPA BISA LIHAT (Gate PRE-00-F §48: "Visibility ≠ Authorization") — kolom terpisah dari has_permission(), operasi tetap digerbangi permission M10 seperti biasa.';

CREATE TABLE IF NOT EXISTS public.learning_session_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  actor_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  capability   TEXT NOT NULL CHECK (capability IN ('HOST','INSTRUCTOR')),
  status       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  revoked_at   TIMESTAMPTZ,
  revoked_by   UUID REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.learning_session_assignments IS
  'Sumber: STEP10-D entity LEARNING_SESSION_ASSIGNMENTS. `capability` (HOST/INSTRUCTOR) adalah resource capability per-session, BUKAN role platform kedelapan (Gate §29, §42-43 — "No Host platform role is created"). Operasi Host/Instructor butuh DUA lapis: permission M10 YANG SESUAI + baris ACTIVE di tabel ini untuk session terkait (Gate §42: "applicable permission + active resource capability/assignment").';

CREATE TABLE IF NOT EXISTS public.session_enrollments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id             UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  agent_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  activation_reference   TEXT,
  requested_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at           TIMESTAMPTZ,
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, agent_id)
);

COMMENT ON TABLE public.session_enrollments IS
  'Sumber: STEP10-D entity SESSION_ENROLLMENTS. Kolom `agent_id` mengikuti penamaan sumber apa adanya (sama seperti catatan di agent_ai_connections/0016) — bukan berarti hanya role Agent yang bisa mendaftar (Gate §26: lifecycle SessionEnrollment "SERVER/BUSINESS-RULE GOVERNED, NO NEW PERMISSION" — enrolment memakai m04.session_enrollment.create/view yang scope-nya juga mencakup Buyer & Instructor, lihat seed 0009). UNIQUE(session_id, agent_id) mencegah pendaftaran ganda pada session yang sama.';

CREATE TABLE IF NOT EXISTS public.session_provider_bindings (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                    UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  provider_key                  TEXT NOT NULL,
  external_provider_session_id  TEXT,
  binding_state                 TEXT NOT NULL DEFAULT 'active'
                                   CHECK (binding_state IN ('pending','active','ended','failed','replaced')),
  effective_from                TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to                  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.session_provider_bindings IS
  'Sumber: STEP10-D entity SESSION_PROVIDER_BINDINGS. `provider_key` teks bebas (bukan FK ke ai_providers/M13 — provider di sini adalah provider TEKNIS penyelenggara sesi seperti Zoom/Google Meet, beda domain dari M13 AI Provider Catalogue meski istilahnya sama-sama "provider". Gate §30: "M04 treats Provider as an execution mechanism, not business authority... M13 provider catalogue authority remains separate").';

-- ── RLS ── permission SUDAH ADA di seed 0009 sejak Tahap 1 (14-row Session
-- family, Gate §45-46). Tidak ada permission baru dibuat di migration ini.

ALTER TABLE public.learning_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_enrollments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_provider_bindings   ENABLE ROW LEVEL SECURITY;

-- learning_sessions — SELECT lebih kompleks dari sekadar has_permission(owner)
-- karena "OWN" untuk Agent/Buyer di Gate §23 berarti "session yang diikuti",
-- BUKAN "session yang dimiliki" (owner_id selalu Instructor/staff yang membuat).
-- Ditambah `visibility='public'` sebagai jalur terpisah (Gate §48: visibility
-- ≠ authorization — publik boleh LIHAT tanpa berarti boleh BERTINDAK).
CREATE POLICY learning_sessions_select ON public.learning_sessions
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR (owner_id = auth.uid() AND public.has_permission('m04.learning_session.view', owner_id))
    OR EXISTS (
      SELECT 1 FROM public.session_enrollments se
      WHERE se.session_id = learning_sessions.id AND se.agent_id = auth.uid()
    )
    OR (visibility = 'public' AND status IN ('scheduled','live','ended') AND auth.uid() IS NOT NULL)
  );

CREATE POLICY learning_sessions_insert ON public.learning_sessions
  FOR INSERT WITH CHECK (public.has_permission('m04.learning_session.create', owner_id));

CREATE POLICY learning_sessions_update ON public.learning_sessions
  FOR UPDATE USING (public.has_permission('m04.learning_session.update', owner_id));

CREATE POLICY learning_sessions_delete ON public.learning_sessions
  FOR DELETE USING (public.has_permission('m04.learning_session.delete', owner_id));

-- learning_session_assignments — Assign = Superadmin/Admin/Manager ALL saja
-- (Gate §28: Instructor=NONE, Agent=NONE untuk MEMBUAT assignment; Instructor
-- baru relevan SETELAH ditugaskan, bukan untuk menugaskan diri sendiri).
CREATE POLICY learning_session_assignments_select ON public.learning_session_assignments
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR actor_id = auth.uid()
  );

CREATE POLICY learning_session_assignments_manage ON public.learning_session_assignments
  FOR ALL USING (public.has_permission('m04.session_assignment.assign'))
  WITH CHECK (public.has_permission('m04.session_assignment.assign'));

-- session_enrollments — Create/View scope OWN untuk Agent/Buyer/Instructor
-- (Gate §26-27), ALL untuk Superadmin/Admin/Manager.
CREATE POLICY session_enrollments_select ON public.session_enrollments
  FOR SELECT USING (public.has_permission('m04.session_enrollment.view', agent_id));

CREATE POLICY session_enrollments_insert ON public.session_enrollments
  FOR INSERT WITH CHECK (public.has_permission('m04.session_enrollment.create', agent_id));

-- Tidak ada UPDATE policy untuk enrolee biasa (Gate §26: "SessionEnrollment
-- lifecycle authority = NO NEW PERMISSION, SERVER/BUSINESS-RULE GOVERNED") —
-- transisi status (activated/completed) lewat fungsi bisnis, bukan UPDATE
-- langsung actor. Superadmin/Admin/Manager tetap bisa via bypass di has_permission.
CREATE POLICY session_enrollments_manage_staff ON public.session_enrollments
  FOR UPDATE USING (public.is_superadmin() OR public.current_role_code() IN ('admin','manager'));

-- session_provider_bindings — Provider Manage = Superadmin/Admin/Manager ALL
-- saja (Gate §30, Instructor/Agent=NONE).
CREATE POLICY session_provider_bindings_select ON public.session_provider_bindings
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (
      SELECT 1 FROM public.learning_sessions ls
      WHERE ls.id = session_provider_bindings.session_id
        AND (ls.owner_id = auth.uid()
             OR EXISTS (SELECT 1 FROM public.session_enrollments se WHERE se.session_id = ls.id AND se.agent_id = auth.uid()))
    )
  );

CREATE POLICY session_provider_bindings_manage ON public.session_provider_bindings
  FOR ALL USING (public.has_permission('m04.learning_provider.manage'))
  WITH CHECK (public.has_permission('m04.learning_provider.manage'));
