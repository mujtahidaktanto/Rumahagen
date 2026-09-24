-- 0136_m04_course_review_workflow.sql
-- Alur "minta terbit" untuk kursus buatan Instruktur. Sejak 0130 hanya staf (izin m04.course.publish) yang boleh menerbitkan kursus, tetapi
-- Instruktur tidak punya cara meminta: tidak ada status antara, tidak ada catatan penolakan, dan tidak ada pemberitahuan.
-- PRASYARAT: migration 0135 (memakai quiz_problems()).
--
-- Model:
--   * Status baru `pending_review` (menunggu tinjauan): draft -> pending_review -> published | draft (dikembalikan).
--   * Mengajukan (draft -> pending_review) oleh pemilik atau staf; syarat: kursus punya minimal 1 pelajaran dan semua kuisnya siap
--     (quiz_problems kosong). Mengisi `submitted_for_review_at` dan mengosongkan catatan/peninjau lama.
--   * Menarik kembali (pending_review -> draft) oleh pemilik. Menolak (pending_review -> draft) oleh staf WAJIB berisi `review_note`;
--     mengisi `reviewed_by`/`reviewed_at`. Menyetujui (pending_review -> published) hanya staf (m04.course.publish); mengisi peninjau.
--   * Pemilik non-staf hanya boleh transisi: draft->pending_review, pending_review->draft, draft->archived, published->archived, archived->draft.
--     Transisi lain (mis. ke published) hanya staf. INSERT kursus oleh non-staf hanya berstatus draft.
--   * Selama `pending_review`, non-staf tidak bisa mengubah kursus, pelajaran, kuis, soal, dan opsi (yang ditinjau tidak berubah di bawah peninjau).
--     Staf tetap bisa. Kursus yang sudah terbit tetap bisa diedit pemiliknya (perilaku sebelumnya, tidak diubah di sini).
--   * Pemilik diberi notifikasi saat kursusnya disetujui atau dikembalikan (catatan penolakan disertakan).
-- Tabel courses kosong saat migration ini ditulis (dicek live).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE public.courses
  ADD CONSTRAINT courses_status_check CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));

COMMENT ON COLUMN public.courses.review_note IS 'Catatan peninjau saat mengembalikan kursus ke draf (wajib diisi staf saat menolak).';

-- ═══ Alur status ═══
CREATE OR REPLACE FUNCTION public.enforce_course_status_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_staff boolean;
  v_owner boolean;
  v_lessons int;
  v_problems text[];
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  v_staff := public.has_permission('m04.course.publish');

  IF TG_OP = 'INSERT' THEN
    IF NOT v_staff AND NEW.status <> 'draft' THEN
      RAISE EXCEPTION 'courses: kursus baru oleh non-staf harus berstatus draft' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  v_owner := OLD.created_by = auth.uid();

  -- Kursus sedang ditinjau: non-staf tidak boleh mengubah isi (perubahan status ditangani di bawah).
  IF OLD.status = 'pending_review' AND NEW.status = 'pending_review' AND NOT v_staff
     AND (to_jsonb(NEW) - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'updated_at') THEN
    RAISE EXCEPTION 'courses: kursus sedang ditinjau dan tidak bisa diubah; tarik kembali ke draf untuk mengedit' USING ERRCODE = '23514';
  END IF;

  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT v_staff AND NOT (
       (OLD.status = 'draft' AND NEW.status IN ('pending_review', 'archived'))
    OR (OLD.status = 'pending_review' AND NEW.status = 'draft')
    OR (OLD.status = 'published' AND NEW.status = 'archived')
    OR (OLD.status = 'archived' AND NEW.status = 'draft')
  ) THEN
    RAISE EXCEPTION 'courses: transisi status % -> % hanya untuk staf', OLD.status, NEW.status USING ERRCODE = '42501';
  END IF;

  IF NEW.status = 'pending_review' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'courses: hanya kursus draf yang bisa diajukan untuk terbit' USING ERRCODE = '23514';
    END IF;
    IF NOT v_staff AND NOT v_owner THEN
      RAISE EXCEPTION 'courses: hanya pemilik kursus yang bisa mengajukan' USING ERRCODE = '42501';
    END IF;
    SELECT count(*) INTO v_lessons FROM public.course_lessons WHERE course_id = OLD.id;
    IF v_lessons = 0 THEN
      RAISE EXCEPTION 'courses: kursus harus punya minimal 1 pelajaran sebelum diajukan' USING ERRCODE = '23514';
    END IF;
    SELECT public.quiz_problems(q.id) INTO v_problems
      FROM public.quizzes q WHERE q.course_id = OLD.id AND array_length(public.quiz_problems(q.id), 1) > 0 LIMIT 1;
    IF v_problems IS NOT NULL THEN
      RAISE EXCEPTION 'courses: ada kuis yang belum siap: %', v_problems[1] USING ERRCODE = '23514';
    END IF;
    NEW.submitted_for_review_at := now();
    NEW.review_note := NULL;
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
  ELSIF OLD.status = 'pending_review' AND NEW.status = 'draft' THEN
    IF v_owner THEN
      NEW.submitted_for_review_at := NULL;
    ELSE
      IF NEW.review_note IS NULL OR btrim(NEW.review_note) = '' THEN
        RAISE EXCEPTION 'courses: menolak pengajuan wajib menyertakan catatan' USING ERRCODE = '23514';
      END IF;
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := now();
    END IF;
  ELSIF OLD.status = 'pending_review' AND NEW.status = 'published' THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_course_status_workflow ON public.courses;
CREATE TRIGGER trg_course_status_workflow
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_course_status_workflow();

-- ═══ Isi kursus terkunci untuk non-staf selama ditinjau ═══
CREATE OR REPLACE FUNCTION public.course_is_under_review(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id AND status = 'pending_review');
$$;
REVOKE ALL ON FUNCTION public.course_is_under_review(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.enforce_course_content_lock_during_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_row jsonb;
  v_course uuid;
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  v_row := to_jsonb(COALESCE(NEW, OLD));
  IF TG_TABLE_NAME IN ('course_lessons', 'quizzes') THEN
    v_course := (v_row ->> 'course_id')::uuid;
  ELSIF TG_TABLE_NAME = 'quiz_questions' THEN
    SELECT course_id INTO v_course FROM public.quizzes WHERE id = (v_row ->> 'quiz_id')::uuid;
  ELSIF TG_TABLE_NAME = 'quiz_options' THEN
    SELECT z.course_id INTO v_course FROM public.quiz_questions q JOIN public.quizzes z ON z.id = q.quiz_id WHERE q.id = (v_row ->> 'question_id')::uuid;
  END IF;
  IF v_course IS NOT NULL AND public.course_is_under_review(v_course) AND NOT public.has_permission('m04.course.publish') THEN
    RAISE EXCEPTION 'courses: kursus sedang ditinjau; isi tidak bisa diubah sampai ditolak atau ditarik kembali' USING ERRCODE = '23514';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
DROP TRIGGER IF EXISTS trg_lessons_review_lock ON public.course_lessons;
CREATE TRIGGER trg_lessons_review_lock BEFORE INSERT OR UPDATE OR DELETE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.enforce_course_content_lock_during_review();
DROP TRIGGER IF EXISTS trg_quizzes_review_lock ON public.quizzes;
CREATE TRIGGER trg_quizzes_review_lock BEFORE INSERT OR UPDATE OR DELETE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.enforce_course_content_lock_during_review();
DROP TRIGGER IF EXISTS trg_quiz_questions_review_lock ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_review_lock BEFORE INSERT OR UPDATE OR DELETE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.enforce_course_content_lock_during_review();
DROP TRIGGER IF EXISTS trg_quiz_options_review_lock ON public.quiz_options;
CREATE TRIGGER trg_quiz_options_review_lock BEFORE INSERT OR UPDATE OR DELETE ON public.quiz_options FOR EACH ROW EXECUTE FUNCTION public.enforce_course_content_lock_during_review();

-- ═══ Notifikasi ke pemilik ═══
CREATE OR REPLACE FUNCTION public.trg_notify_course_review()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending_review' AND NEW.status = 'published' THEN
    PERFORM public.notify_user(NEW.created_by, 'approval_status', 'Kursus disetujui',
      'Kursus "' || NEW.title || '" disetujui dan kini tampil di katalog.', 'course', NEW.id);
  ELSIF OLD.status = 'pending_review' AND NEW.status = 'draft' AND NEW.reviewed_by IS NOT NULL AND NEW.reviewed_by IS DISTINCT FROM NEW.created_by THEN
    PERFORM public.notify_user(NEW.created_by, 'approval_status', 'Kursus dikembalikan',
      'Kursus "' || NEW.title || '" dikembalikan ke draf. Catatan: ' || COALESCE(NEW.review_note, '-'), 'course', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_course_review ON public.courses;
CREATE TRIGGER trg_notify_course_review
  AFTER UPDATE OF status ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_course_review();
