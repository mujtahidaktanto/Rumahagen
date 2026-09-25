-- 0155_m04_m15_course_completion_title.sql
-- Title otomatis dari kelulusan course (keputusan pemilik produk 2026-09-26). Sebelumnya title (M15) hanya bisa diberikan staf lewat evaluasi kualifikasi manual dan
-- tidak ada hubungan course -> title. Kini staf dapat menghubungkan SATU title ke sebuah course (`courses.awards_title_definition_id`); begitu Agent menyelesaikan course itu
-- (enrollments.status = 'completed', yang sudah otomatis terjadi saat semua kuis lulus), sistem mencatat satu qualification_evaluations 'qualified' (evaluator system_automated,
-- provenance course_completion) lalu satu award_instances 'active'. Semua aturan M15 yang ada tetap berlaku (trigger evaluasi harus qualified milik user yang sama, title harus
-- punya title_authority_scopes aktif); trigger rebalance/notify yang sudah ada otomatis memilih title utama dan mengirim notifikasi. Tidak mengubah fungsi/trigger lama
-- kecuali enforce_course_certificate_config_staff_only (ditambah kolom baru, staf saja).
--
-- Aturan:
--  * Hanya staf (m04.course.publish) yang boleh mengatur `awards_title_definition_id`; title harus `active` dan punya title_authority_scopes aktif saat dihubungkan.
--  * Idempoten dan hormat pencabutan: bila user SUDAH punya award (status apa pun, termasuk revoked/expired) untuk title itu, tidak diberi lagi.
--  * Penerbitan title TIDAK PERNAH menggagalkan kelulusan course: kegagalan di dalam fungsi hanya menjadi WARNING (mis. scope dinonaktifkan setelah dihubungkan).
--  * Menghubungkan title ke course yang sudah punya lulusan memberi title ke lulusan yang ada (backfill), kecuali yang sudah punya.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS awards_title_definition_id uuid REFERENCES public.title_definitions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_courses_awards_title ON public.courses (awards_title_definition_id) WHERE awards_title_definition_id IS NOT NULL;
COMMENT ON COLUMN public.courses.awards_title_definition_id IS 'Title (M15) yang diberikan otomatis kepada Agent yang menyelesaikan course ini. Diatur staf.';

-- Staf saja (perluasan fungsi 0150: kolom baru ikut dijaga bersama konfigurasi sertifikat dan aturan kuis).
CREATE OR REPLACE FUNCTION public.enforce_course_certificate_config_staff_only()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_staff boolean;
  p text;
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  v_staff := public.has_permission('m04.course.publish');
  IF NOT v_staff THEN
    IF TG_OP = 'INSERT' THEN
      NEW.organizer_type := 'instructor';
      IF NEW.certificate_template IS NOT NULL OR NEW.signer_name IS NOT NULL OR NEW.signer_title IS NOT NULL OR NEW.signer_signature_path IS NOT NULL
         OR cardinality(NEW.partner_logo_paths) > 0 OR NEW.quiz_max_attempts IS NOT NULL OR NEW.quiz_cooldown_minutes IS NOT NULL
         OR NEW.awards_title_definition_id IS NOT NULL THEN
        RAISE EXCEPTION 'courses: konfigurasi sertifikat dan aturan kuis hanya bisa diatur staf' USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.organizer_type IS DISTINCT FROM OLD.organizer_type OR NEW.certificate_template IS DISTINCT FROM OLD.certificate_template
       OR NEW.signer_name IS DISTINCT FROM OLD.signer_name OR NEW.signer_title IS DISTINCT FROM OLD.signer_title
       OR NEW.signer_signature_path IS DISTINCT FROM OLD.signer_signature_path OR NEW.partner_logo_paths IS DISTINCT FROM OLD.partner_logo_paths
       OR NEW.quiz_max_attempts IS DISTINCT FROM OLD.quiz_max_attempts OR NEW.quiz_cooldown_minutes IS DISTINCT FROM OLD.quiz_cooldown_minutes
       OR NEW.awards_title_definition_id IS DISTINCT FROM OLD.awards_title_definition_id THEN
      RAISE EXCEPTION 'courses: konfigurasi sertifikat dan aturan kuis hanya bisa diatur staf' USING ERRCODE = '42501';
    END IF;
  END IF;
  -- file hanya boleh milik kursus ini (folder courses/{id}/)
  IF NEW.signer_signature_path IS NOT NULL AND left(NEW.signer_signature_path, length('courses/' || NEW.id::text) + 1) <> 'courses/' || NEW.id::text || '/' THEN
    RAISE EXCEPTION 'courses: file tanda tangan harus berada di folder kursus ini' USING ERRCODE = '23514';
  END IF;
  FOREACH p IN ARRAY NEW.partner_logo_paths LOOP
    IF left(p, length('courses/' || NEW.id::text) + 1) <> 'courses/' || NEW.id::text || '/' OR length(p) > 300 THEN
      RAISE EXCEPTION 'courses: logo mitra harus berada di folder kursus ini' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  RETURN NEW;
END; $$;

-- Validasi saat dihubungkan: title harus aktif dan punya scope aktif (kalau tidak, award tidak akan pernah bisa dibuat: trg_award_requires_authority_scope).
CREATE OR REPLACE FUNCTION public.validate_course_awards_title()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.awards_title_definition_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.awards_title_definition_id IS DISTINCT FROM OLD.awards_title_definition_id) THEN
    IF NOT EXISTS (SELECT 1 FROM public.title_definitions td WHERE td.id = NEW.awards_title_definition_id AND td.status = 'active') THEN
      RAISE EXCEPTION 'courses: title yang dihubungkan harus berstatus active' USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.title_authority_scopes tas WHERE tas.title_definition_id = NEW.awards_title_definition_id AND tas.status = 'active') THEN
      RAISE EXCEPTION 'courses: title yang dihubungkan belum punya title_authority_scopes aktif' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_course_validate_awards_title ON public.courses;
CREATE TRIGGER trg_course_validate_awards_title BEFORE INSERT OR UPDATE OF awards_title_definition_id ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.validate_course_awards_title();

-- Pemberian title untuk satu pendaftaran yang sudah selesai. TIDAK PERNAH melempar galat (kelulusan course tidak boleh gagal karena title).
CREATE OR REPLACE FUNCTION public.grant_course_completion_title(p_enrollment_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_agent uuid;
  v_course uuid;
  v_status text;
  v_title uuid;
  v_eval uuid;
BEGIN
  SELECT e.agent_id, e.course_id, e.status, c.awards_title_definition_id INTO v_agent, v_course, v_status, v_title
    FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id
    WHERE e.id = p_enrollment_id;
  IF v_title IS NULL OR v_status IS DISTINCT FROM 'completed' THEN
    RETURN false;
  END IF;
  -- Sudah pernah punya award untuk title ini (apa pun statusnya, termasuk dicabut): jangan diberi lagi.
  IF EXISTS (SELECT 1 FROM public.award_instances a WHERE a.user_id = v_agent AND a.title_definition_id = v_title) THEN
    RETURN false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.title_definitions td WHERE td.id = v_title AND td.status = 'active') THEN
    RETURN false;
  END IF;

  INSERT INTO public.qualification_evaluations (user_id, result, evaluator_type, evaluator_reference, provenance)
  VALUES (v_agent, 'qualified', 'system_automated', 'course_completion:' || v_course::text,
          jsonb_build_object('source', 'course_completion', 'course_id', v_course, 'enrollment_id', p_enrollment_id))
  RETURNING id INTO v_eval;

  INSERT INTO public.award_instances (user_id, title_definition_id, qualification_evaluation_id, status, historical_snapshot)
  VALUES (v_agent, v_title, v_eval, 'active',
          jsonb_build_object('source', 'course_completion', 'course_id', v_course, 'enrollment_id', p_enrollment_id));

  PERFORM public.log_audit_event(
    p_action      := 'm15.award.auto_course_completion',
    p_entity_type := 'award_instances',
    p_entity_id   := NULL,
    p_new_value   := jsonb_build_object('user_id', v_agent, 'title_definition_id', v_title, 'course_id', v_course)
  );
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'grant_course_completion_title(%): title tidak diberikan: %', p_enrollment_id, SQLERRM;
  RETURN false;
END; $$;
REVOKE ALL ON FUNCTION public.grant_course_completion_title(uuid) FROM PUBLIC, anon, authenticated;

-- Pemicu: pendaftaran menjadi 'completed'.
CREATE OR REPLACE FUNCTION public.trg_grant_course_completion_title()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    PERFORM public.grant_course_completion_title(NEW.id);
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.trg_grant_course_completion_title() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_enrollment_grant_course_title ON public.enrollments;
CREATE TRIGGER trg_enrollment_grant_course_title AFTER INSERT OR UPDATE OF status ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.trg_grant_course_completion_title();

-- Backfill: title dihubungkan ke course yang sudah punya lulusan -> lulusan yang belum punya diberi title.
CREATE OR REPLACE FUNCTION public.trg_backfill_course_awards_title()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  e record;
BEGIN
  IF NEW.awards_title_definition_id IS NOT NULL AND NEW.awards_title_definition_id IS DISTINCT FROM OLD.awards_title_definition_id THEN
    FOR e IN SELECT id FROM public.enrollments WHERE course_id = NEW.id AND status = 'completed' LOOP
      PERFORM public.grant_course_completion_title(e.id);
    END LOOP;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.trg_backfill_course_awards_title() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_course_backfill_awards_title ON public.courses;
CREATE TRIGGER trg_course_backfill_awards_title AFTER UPDATE OF awards_title_definition_id ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.trg_backfill_course_awards_title();
