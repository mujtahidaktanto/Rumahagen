-- 0135_m04_quiz_integrity.sql
-- Integritas kuis M04 untuk API ubah/hapus kuis, soal, dan opsi (sebelumnya API hanya bisa menambah; SOURCE-Admin-Kursus-Redirect.md temuan 4).
-- Begitu kuis bisa diubah dan dihapus, muncul risiko yang sebelumnya tertutup karena kuis praktis tak bisa diubah:
--   * Menghapus kuis/soal/opsi atau membalik `is_correct` setelah peserta mengerjakan mengubah makna nilai lama; menghapus kuis juga
--     menghapus berantai `quiz_attempts` (FK ON DELETE CASCADE) sehingga riwayat percobaan hilang.
--   * Kuis tanpa soal, soal tanpa jawaban benar, atau soal `single_choice` dengan lebih dari satu jawaban benar tidak bisa dinilai wajar
--     (peserta selalu salah atau selalu benar), tetapi tidak ada yang mencegah kursus berkuis seperti itu diterbitkan.
--
-- Model setelah migration ini:
--   * Kuis "punya percobaan" = ada baris quiz_attempts untuk kuis itu. Untuk kuis seperti itu: opsi tidak bisa dihapus, ditambah, atau diubah
--     `is_correct`-nya; soal tidak bisa dihapus atau diubah jenisnya; kuis tidak bisa dihapus. Teks soal/opsi dan judul kuis tetap bisa
--     diperbaiki (salah ketik) dan soal baru tetap bisa ditambah. Untuk perubahan struktur, buat kuis baru.
--   * Kuis tidak bisa dipindah ke kursus lain.
--   * `quiz_problems(quiz_id)` mengembalikan daftar masalah kesiapan kuis: tanpa soal, soal dengan kurang dari 2 opsi, tanpa jawaban benar,
--     atau `single_choice` dengan jawaban benar selain tepat satu.
--   * Kursus tidak bisa diterbitkan (INSERT/UPDATE ke `published`) bila salah satu kuisnya bermasalah; berlaku untuk semua peran,
--     karena kuis rusak merusak penilaian, bukan soal wewenang.
-- Tabel quizzes/quiz_questions/quiz_options/quiz_attempts kosong saat migration ini ditulis (dicek live).

CREATE OR REPLACE FUNCTION public.quiz_has_attempts(p_quiz_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.quiz_attempts WHERE quiz_id = p_quiz_id);
$$;
REVOKE ALL ON FUNCTION public.quiz_has_attempts(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.quiz_problems(p_quiz_id uuid)
RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_problems text[] := ARRAY[]::text[];
  v_count int;
  q record;
  v_opts int;
  v_correct int;
BEGIN
  SELECT count(*) INTO v_count FROM public.quiz_questions WHERE quiz_id = p_quiz_id;
  IF v_count = 0 THEN
    RETURN ARRAY['kuis belum punya soal'];
  END IF;
  FOR q IN SELECT id, question_type FROM public.quiz_questions WHERE quiz_id = p_quiz_id ORDER BY id LOOP
    SELECT count(*), count(*) FILTER (WHERE is_correct) INTO v_opts, v_correct FROM public.quiz_options WHERE question_id = q.id;
    IF v_opts < 2 THEN
      v_problems := v_problems || ('soal ' || q.id || ' punya kurang dari 2 opsi');
    ELSIF v_correct = 0 THEN
      v_problems := v_problems || ('soal ' || q.id || ' belum punya jawaban benar');
    ELSIF q.question_type = 'single_choice' AND v_correct <> 1 THEN
      v_problems := v_problems || ('soal pilihan tunggal ' || q.id || ' harus punya tepat satu jawaban benar');
    END IF;
  END LOOP;
  RETURN v_problems;
END;
$$;
REVOKE ALL ON FUNCTION public.quiz_problems(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_problems(uuid) TO authenticated;

-- Kuis: tidak dipindah kursus, tidak dihapus bila sudah punya percobaan.
CREATE OR REPLACE FUNCTION public.enforce_quiz_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.quiz_has_attempts(OLD.id) THEN
      RAISE EXCEPTION 'quizzes: kuis yang sudah dikerjakan peserta tidak bisa dihapus' USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;
  IF NEW.course_id IS DISTINCT FROM OLD.course_id THEN
    RAISE EXCEPTION 'quizzes: kuis tidak bisa dipindah ke kursus lain' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_quiz_integrity ON public.quizzes;
CREATE TRIGGER trg_quiz_integrity
  BEFORE UPDATE OR DELETE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_integrity();

-- Soal: tidak dipindah kuis; jenis dan penghapusan terkunci setelah ada percobaan.
CREATE OR REPLACE FUNCTION public.enforce_quiz_question_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF public.quiz_has_attempts(OLD.quiz_id) THEN
      RAISE EXCEPTION 'quiz_questions: soal pada kuis yang sudah dikerjakan tidak bisa dihapus' USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;
  IF NEW.quiz_id IS DISTINCT FROM OLD.quiz_id THEN
    RAISE EXCEPTION 'quiz_questions: soal tidak bisa dipindah ke kuis lain' USING ERRCODE = '23514';
  END IF;
  IF NEW.question_type IS DISTINCT FROM OLD.question_type AND public.quiz_has_attempts(OLD.quiz_id) THEN
    RAISE EXCEPTION 'quiz_questions: jenis soal pada kuis yang sudah dikerjakan tidak bisa diubah' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_quiz_question_integrity ON public.quiz_questions;
CREATE TRIGGER trg_quiz_question_integrity
  BEFORE UPDATE OR DELETE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_question_integrity();

-- Opsi: struktur dan kunci jawaban terkunci setelah ada percobaan; teks opsi tetap bisa diperbaiki.
CREATE OR REPLACE FUNCTION public.enforce_quiz_option_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_quiz uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT quiz_id INTO v_quiz FROM public.quiz_questions WHERE id = NEW.question_id;
    IF v_quiz IS NOT NULL AND public.quiz_has_attempts(v_quiz) THEN
      RAISE EXCEPTION 'quiz_options: opsi tidak bisa ditambah pada kuis yang sudah dikerjakan' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;
  SELECT quiz_id INTO v_quiz FROM public.quiz_questions WHERE id = OLD.question_id;
  IF TG_OP = 'DELETE' THEN
    IF v_quiz IS NOT NULL AND public.quiz_has_attempts(v_quiz) THEN
      RAISE EXCEPTION 'quiz_options: opsi pada kuis yang sudah dikerjakan tidak bisa dihapus' USING ERRCODE = '23514';
    END IF;
    RETURN OLD;
  END IF;
  IF NEW.question_id IS DISTINCT FROM OLD.question_id THEN
    RAISE EXCEPTION 'quiz_options: opsi tidak bisa dipindah ke soal lain' USING ERRCODE = '23514';
  END IF;
  IF NEW.is_correct IS DISTINCT FROM OLD.is_correct AND v_quiz IS NOT NULL AND public.quiz_has_attempts(v_quiz) THEN
    RAISE EXCEPTION 'quiz_options: kunci jawaban pada kuis yang sudah dikerjakan tidak bisa diubah' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_quiz_option_integrity ON public.quiz_options;
CREATE TRIGGER trg_quiz_option_integrity
  BEFORE INSERT OR UPDATE OR DELETE ON public.quiz_options
  FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_option_integrity();

-- Kursus tidak boleh diterbitkan bila ada kuis yang tidak siap dinilai.
CREATE OR REPLACE FUNCTION public.enforce_course_quizzes_ready_on_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  qz record;
  v_problems text[];
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    FOR qz IN SELECT id, title FROM public.quizzes WHERE course_id = NEW.id LOOP
      v_problems := public.quiz_problems(qz.id);
      IF array_length(v_problems, 1) > 0 THEN
        RAISE EXCEPTION 'courses: kursus tidak bisa diterbitkan, kuis "%" belum siap: %', COALESCE(qz.title, qz.id::text), v_problems[1]
          USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_course_quizzes_ready_on_publish ON public.courses;
CREATE TRIGGER trg_course_quizzes_ready_on_publish
  BEFORE INSERT OR UPDATE OF status ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_course_quizzes_ready_on_publish();
