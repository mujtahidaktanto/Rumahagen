-- 0130_close_m04_course_completion_publish_quiz_and_redirect_gaps.sql
-- Menutup celah M04 Learning Catalog + M11 url_redirects yang ditemukan saat memindai layar Admin
-- Kelola Kursus dan Pengalihan URL (Fase D-lanjutan, SOURCE-Admin-Kursus-Redirect.md §5).
-- Celah 1 dibuktikan di DB live lewat transaksi rollback (2026-09-24); lainnya terbaca dari policy/kode.
--
--   1. Agent bisa menyelesaikan kursusnya sendiri: enrollments_update memakai izin *view* (scope own), jadi
--      UPDATE status='completed', progress_percent=100, completed_at=now() berhasil tanpa kuis. Begitu juga INSERT
--      enrollment langsung 'completed', enroll ke kursus draft/archived, dan melewati prasyarat kursus.
--   2. Instructor (m04.course.manage own) bisa membuat/mengubah kursus langsung 'published' tanpa tinjauan staf.
--   3. quiz_attempts_insert hanya memeriksa kepemilikan enrollment, jadi Agent bisa INSERT percobaan kuis dengan
--      score=100/passed=true lewat PostgREST tanpa menjawab apa pun. (Route submit juga menilai dari soal yang
--      DIJAWAB, bukan total soal; itu diperbaiki di kode aplikasi pada perubahan yang sama.)
--   4. url_redirects: path bebas (tanpa awalan "/", boleh URL luar = open redirect, boleh menunjuk dirinya sendiri,
--      putaran A->B->A tidak dicek).
--
-- Model setelah migration ini:
--   * Peserta hanya boleh mengubah progres (0-99) enrollment miliknya; status 'completed', completed_at, dan
--     progres 100 hanya lahir dari kuis yang lulus (trigger AFTER INSERT quiz_attempts) atau staf.
--   * Enrollment baru oleh non-staf: harus in_progress/0%, kursus harus published, dan prasyarat kursus (bila ada) harus
--     sudah completed.
--   * Menerbitkan kursus (INSERT/UPDATE ke 'published') butuh izin baru m04.course.publish (Superadmin/Admin/Manager=ALL).
--     Instructor tetap bisa membuat dan mengubah draf miliknya, lalu staf yang menerbitkan. (Mengubah kursus yang sudah
--     terbit oleh pemiliknya tetap diizinkan.)
--   * quiz_attempts hanya ditulis server (service_role): tidak ada policy INSERT untuk pengguna.
--   * url_redirects hanya jalur internal ("/..." tanpa "//", spasi, atau "\"), bukan diri sendiri, dan tanpa putaran
--     (rantai ke depan dari tujuan tidak boleh kembali ke jalur lama; maksimal 10 lompatan).

-- ═══ 1. Enrollment kursus ═══
CREATE OR REPLACE FUNCTION public.course_enroll_problem(p_course_id uuid, p_agent_id uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_pre uuid;
BEGIN
  SELECT status, prerequisite_course_id INTO v_status, v_pre
  FROM public.courses WHERE id = p_course_id AND deleted_at IS NULL;
  IF v_status IS NULL OR v_status <> 'published' THEN
    RETURN 'kursus belum terbit atau tidak ditemukan';
  END IF;
  IF v_pre IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.enrollments e WHERE e.agent_id = p_agent_id AND e.course_id = v_pre AND e.status = 'completed'
  ) THEN
    RETURN 'prasyarat kursus belum diselesaikan';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_enrollment_insert_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_problem text;
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_permission('m04.course_enrollment.view') THEN
    RETURN NEW;  -- staf (scope all)
  END IF;
  IF NEW.status <> 'in_progress' OR COALESCE(NEW.progress_percent, 0) <> 0 OR NEW.completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'enrollments: enrollment baru harus in_progress dengan progres 0 (penyelesaian hanya lewat kuis atau staf)'
      USING ERRCODE = '42501';
  END IF;
  v_problem := public.course_enroll_problem(NEW.course_id, NEW.agent_id);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'enrollments: %', v_problem USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enrollment_insert_rules ON public.enrollments;
CREATE TRIGGER trg_enrollment_insert_rules
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_enrollment_insert_rules();

CREATE OR REPLACE FUNCTION public.enforce_enrollment_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_permission('m04.course_enrollment.view') THEN
    RETURN NEW;  -- staf (scope all)
  END IF;
  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.enrolled_at IS DISTINCT FROM OLD.enrolled_at THEN
    RAISE EXCEPTION 'enrollments: pemilik, kursus, dan waktu daftar tidak boleh diubah' USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    RAISE EXCEPTION 'enrollments: status selesai hanya diberikan lewat kuis yang lulus atau staf' USING ERRCODE = '42501';
  END IF;
  IF NEW.progress_percent IS DISTINCT FROM OLD.progress_percent
     AND (OLD.status = 'completed' OR COALESCE(NEW.progress_percent, 0) > 99) THEN
    RAISE EXCEPTION 'enrollments: progres peserta maksimal 99; 100 hanya lewat penyelesaian' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enrollment_update_rules ON public.enrollments;
CREATE TRIGGER trg_enrollment_update_rules
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_enrollment_update_rules();

-- ═══ 2. Penerbitan kursus butuh izin staf ═══
INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.course.publish', 'all', 'Course - Publish (ADD-NEW; mengubah status kursus menjadi published; Superadmin/Admin/Manager=ALL, Instructor tidak punya)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM (VALUES ('superadmin'), ('admin'), ('manager')) AS x(role_code)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = 'm04.course.publish'
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_course_publish_permission()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published')
     AND NOT public.has_permission('m04.course.publish') THEN
    RAISE EXCEPTION 'courses: menerbitkan kursus butuh permission m04.course.publish (ditinjau staf)'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_course_publish_permission ON public.courses;
CREATE TRIGGER trg_course_publish_permission
  BEFORE INSERT OR UPDATE OF status ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_course_publish_permission();

-- ═══ 3. Percobaan kuis hanya ditulis server, dan kelulusan menyelesaikan enrollment ═══
DROP POLICY IF EXISTS quiz_attempts_insert ON public.quiz_attempts;

CREATE OR REPLACE FUNCTION public.complete_enrollment_on_quiz_pass()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course uuid;
BEGIN
  IF NEW.passed IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  SELECT course_id INTO v_course FROM public.enrollments WHERE id = NEW.enrollment_id;
  IF v_course IS NULL THEN
    RETURN NEW;
  END IF;
  -- Selesai bila SEMUA kuis kursus itu sudah pernah lulus oleh enrollment ini.
  IF NOT EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.course_id = v_course
      AND NOT EXISTS (
        SELECT 1 FROM public.quiz_attempts a
        WHERE a.enrollment_id = NEW.enrollment_id AND a.quiz_id = q.id AND a.passed IS TRUE
      )
  ) THEN
    UPDATE public.enrollments
       SET status = 'completed', progress_percent = 100, completed_at = COALESCE(completed_at, now())
     WHERE id = NEW.enrollment_id AND status <> 'completed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_complete_enrollment_on_quiz_pass ON public.quiz_attempts;
CREATE TRIGGER trg_complete_enrollment_on_quiz_pass
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.complete_enrollment_on_quiz_pass();

-- ═══ 4. Validasi url_redirects ═══
-- Tabel kosong saat migration ini ditulis (dicek live), jadi constraint langsung divalidasi.
ALTER TABLE public.url_redirects
  ADD CONSTRAINT url_redirects_old_path_format CHECK (old_path ~ '^/([^/[:space:]\\][^[:space:]\\]*)?$'),
  ADD CONSTRAINT url_redirects_new_path_format CHECK (new_path ~ '^/([^/[:space:]\\][^[:space:]\\]*)?$'),
  ADD CONSTRAINT url_redirects_not_self CHECK (old_path <> new_path);

CREATE OR REPLACE FUNCTION public.enforce_url_redirect_no_loop()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_cur  text := NEW.new_path;
  v_next text;
  v_hops int := 0;
BEGIN
  LOOP
    SELECT r.new_path INTO v_next
    FROM public.url_redirects r
    WHERE r.old_path = v_cur AND r.id IS DISTINCT FROM NEW.id
    LIMIT 1;
    EXIT WHEN v_next IS NULL;
    IF v_next = NEW.old_path THEN
      RAISE EXCEPTION 'url_redirects: pengalihan ini membentuk putaran (% kembali ke %)', NEW.new_path, NEW.old_path
        USING ERRCODE = '23514';
    END IF;
    v_hops := v_hops + 1;
    IF v_hops > 10 THEN
      RAISE EXCEPTION 'url_redirects: rantai pengalihan lebih dari 10 lompatan' USING ERRCODE = '23514';
    END IF;
    v_cur := v_next;
  END LOOP;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_url_redirect_no_loop ON public.url_redirects;
CREATE TRIGGER trg_url_redirect_no_loop
  BEFORE INSERT OR UPDATE OF old_path, new_path ON public.url_redirects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_url_redirect_no_loop();
