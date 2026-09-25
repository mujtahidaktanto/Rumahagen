-- 0150_m04_certificates_learning_settings.sql
-- MVP M04 Learning Configuration (keputusan produk 2026-09-25, lihat memory project-m04-certificate-mvp):
--   1. `learning_settings`: pengaturan belajar eksplisit satu baris (bukan key-value) dengan validasi database, versi, dan jejak audit.
--   2. `courses`: penanda penyelenggara (`organizer_type`: rumahagen|partner|instructor) yang menentukan aturan jeda/batas kuis, template sertifikat,
--      penandatangan, logo mitra (maks 2), dan penimpaan batas percobaan. Semua kolom ini HANYA bisa diubah staf (kunci pada m04.course.publish).
--   3. `certificates`: nomor unik `RA-{tahun}-{6 digit}` (penghitung atomik per tahun), kode verifikasi, status issued|revoked, snapshot penyajian
--      (nama pemegang, judul kursus, template, penandatangan, logo) supaya PDF stabil. Satu sertifikat per Agent per kursus. Terbit OTOMATIS saat
--      enrollment selesai (bisa dimatikan), atau saat Agent mengunduh dan belum punya (ensure_my_certificate). Tabel tidak bisa ditulis langsung.
--      Cabut oleh staf (revoke_certificate), verifikasi publik hanya memuat data aman (verify_certificate).
--   4. Aturan kuis pihak ketiga: kursus internal (rumahagen) tanpa batas dan tanpa jeda; partner/instructor memakai jeda (default 60 menit) dan batas
--      percobaan opsional (bisa ditimpa per kursus), ditegakkan trigger di quiz_attempts.
--   5. Kursus wajib punya minimal 1 kuis untuk diajukan/terbit (sebelumnya kursus tanpa kuis bisa terbit tetapi tidak pernah bisa selesai).
--   6. LP: bonus saldo awal 25 LP (sekali per akun, idempoten) + hadiah per kejadian (enroll, selesai, lulus kuis) yang default 0.
--   7. Bucket privat `certificate-assets` (PNG/JPG/WebP, maks 1 MB) untuk logo mitra dan tanda tangan.
-- Tabel courses/certificates/enrollments kosong saat ditulis (dicek live), jadi backfill hanya berlaku ke depan (blok backfill tetap disertakan).

-- ═══ 1. Pengaturan belajar ═══
CREATE TABLE IF NOT EXISTS public.learning_settings (
  id                             boolean PRIMARY KEY DEFAULT true CHECK (id),
  external_quiz_max_attempts     integer CHECK (external_quiz_max_attempts IS NULL OR external_quiz_max_attempts >= 1),
  external_quiz_cooldown_minutes integer NOT NULL DEFAULT 60 CHECK (external_quiz_cooldown_minutes >= 0),
  certificate_auto_issue         boolean NOT NULL DEFAULT true,
  default_certificate_template   text NOT NULL DEFAULT 'classic' CHECK (default_certificate_template IN ('classic', 'modern', 'corporate', 'premium')),
  default_signer_name            varchar(120) NOT NULL DEFAULT 'Mujtahid Aktanto' CHECK (btrim(default_signer_name) <> ''),
  default_signer_title           varchar(120) NOT NULL DEFAULT 'CEO RumahAgen' CHECK (btrim(default_signer_title) <> ''),
  default_signer_signature_path  text CHECK (default_signer_signature_path IS NULL OR (left(default_signer_signature_path, 9) = 'defaults/' AND length(default_signer_signature_path) <= 300)),
  signup_bonus_lp                numeric(12, 2) NOT NULL DEFAULT 25 CHECK (signup_bonus_lp >= 0),
  reward_lp_enrollment           numeric(12, 2) NOT NULL DEFAULT 0 CHECK (reward_lp_enrollment >= 0),
  reward_lp_completion           numeric(12, 2) NOT NULL DEFAULT 0 CHECK (reward_lp_completion >= 0),
  reward_lp_quiz_pass            numeric(12, 2) NOT NULL DEFAULT 0 CHECK (reward_lp_quiz_pass >= 0),
  version                        integer NOT NULL DEFAULT 1,
  updated_by                     uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at                     timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.learning_settings IS 'M04 (0150): pengaturan belajar satu baris (id=true). Diubah lewat PATCH /admin/learning/settings; perubahan tercatat di audit log dan menaikkan version.';
INSERT INTO public.learning_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.learning_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_settings_select ON public.learning_settings FOR SELECT USING (public.has_permission('m04.learning_economy_configuration.view'));
CREATE POLICY learning_settings_update ON public.learning_settings FOR UPDATE
  USING (public.has_permission('m04.learning_economy_configuration.manage'))
  WITH CHECK (public.has_permission('m04.learning_economy_configuration.manage'));
REVOKE ALL ON public.learning_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON public.learning_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.learning_settings_before_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.id := true;
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  IF auth.uid() IS NOT NULL THEN NEW.updated_by := auth.uid(); END IF;
  RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.learning_settings_after_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.log_audit_event('m04.learning_settings.update', 'learning_settings', NULL, NULL,
      to_jsonb(OLD) - 'updated_at', to_jsonb(NEW) - 'updated_at');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_learning_settings_before_update ON public.learning_settings;
CREATE TRIGGER trg_learning_settings_before_update BEFORE UPDATE ON public.learning_settings FOR EACH ROW EXECUTE FUNCTION public.learning_settings_before_update();
DROP TRIGGER IF EXISTS trg_learning_settings_after_update ON public.learning_settings;
CREATE TRIGGER trg_learning_settings_after_update AFTER UPDATE ON public.learning_settings FOR EACH ROW EXECUTE FUNCTION public.learning_settings_after_update();

-- ═══ 2. Konfigurasi sertifikat dan penyelenggara pada kursus ═══
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS organizer_type         text NOT NULL DEFAULT 'rumahagen' CHECK (organizer_type IN ('rumahagen', 'partner', 'instructor')),
  ADD COLUMN IF NOT EXISTS certificate_template   text CHECK (certificate_template IS NULL OR certificate_template IN ('classic', 'modern', 'corporate', 'premium')),
  ADD COLUMN IF NOT EXISTS signer_name            varchar(120) CHECK (signer_name IS NULL OR btrim(signer_name) <> ''),
  ADD COLUMN IF NOT EXISTS signer_title           varchar(120) CHECK (signer_title IS NULL OR btrim(signer_title) <> ''),
  ADD COLUMN IF NOT EXISTS signer_signature_path  text CHECK (signer_signature_path IS NULL OR length(signer_signature_path) <= 300),
  ADD COLUMN IF NOT EXISTS partner_logo_paths     text[] NOT NULL DEFAULT '{}' CHECK (cardinality(partner_logo_paths) <= 2),
  ADD COLUMN IF NOT EXISTS quiz_max_attempts      integer CHECK (quiz_max_attempts IS NULL OR quiz_max_attempts >= 1),
  ADD COLUMN IF NOT EXISTS quiz_cooldown_minutes  integer CHECK (quiz_cooldown_minutes IS NULL OR quiz_cooldown_minutes >= 0);
COMMENT ON COLUMN public.courses.organizer_type IS 'Penyelenggara kursus (0150): rumahagen = internal (tanpa jeda/batas kuis); partner/instructor = pihak ketiga (jeda kuis berlaku). Bukan provider live (itu per sesi di session_provider_bindings).';

-- Bukan SECURITY DEFINER: pemeriksaan current_user harus melihat peran pemanggil (authenticated), bukan pemilik fungsi.
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
         OR cardinality(NEW.partner_logo_paths) > 0 OR NEW.quiz_max_attempts IS NOT NULL OR NEW.quiz_cooldown_minutes IS NOT NULL THEN
        RAISE EXCEPTION 'courses: konfigurasi sertifikat dan aturan kuis hanya bisa diatur staf' USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.organizer_type IS DISTINCT FROM OLD.organizer_type OR NEW.certificate_template IS DISTINCT FROM OLD.certificate_template
       OR NEW.signer_name IS DISTINCT FROM OLD.signer_name OR NEW.signer_title IS DISTINCT FROM OLD.signer_title
       OR NEW.signer_signature_path IS DISTINCT FROM OLD.signer_signature_path OR NEW.partner_logo_paths IS DISTINCT FROM OLD.partner_logo_paths
       OR NEW.quiz_max_attempts IS DISTINCT FROM OLD.quiz_max_attempts OR NEW.quiz_cooldown_minutes IS DISTINCT FROM OLD.quiz_cooldown_minutes THEN
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
DROP TRIGGER IF EXISTS trg_course_certificate_config_staff_only ON public.courses;
CREATE TRIGGER trg_course_certificate_config_staff_only BEFORE INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.enforce_course_certificate_config_staff_only();

-- Kursus wajib punya minimal 1 kuis untuk diajukan/terbit (kursus tanpa kuis tidak pernah bisa selesai).
CREATE OR REPLACE FUNCTION public.enforce_course_quizzes_ready_on_publish()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  qz record;
  v_problems text[];
BEGIN
  IF NEW.status IN ('pending_review', 'published') AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NOT EXISTS (SELECT 1 FROM public.quizzes WHERE course_id = NEW.id) THEN
      RAISE EXCEPTION 'courses: kursus harus punya minimal 1 kuis sebelum diajukan atau diterbitkan' USING ERRCODE = '23514';
    END IF;
  END IF;
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
END; $$;

-- ═══ 3. Sertifikat ═══
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS enrollment_id       uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS certificate_number  varchar(30),
  ADD COLUMN IF NOT EXISTS verification_code   varchar(20),
  ADD COLUMN IF NOT EXISTS status              text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  ADD COLUMN IF NOT EXISTS revoked_at          timestamptz,
  ADD COLUMN IF NOT EXISTS revoked_by          uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoke_note         text,
  ADD COLUMN IF NOT EXISTS snapshot            jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS certificates_number_key ON public.certificates (certificate_number);
CREATE UNIQUE INDEX IF NOT EXISTS certificates_verification_code_key ON public.certificates (verification_code);
CREATE UNIQUE INDEX IF NOT EXISTS certificates_agent_course_key ON public.certificates (agent_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates (status);
COMMENT ON COLUMN public.certificates.snapshot IS 'Snapshot penyajian saat terbit (holder_name, course_title, organizer_type, template, signer_*, partner_logo_paths) agar PDF stabil; bukan konfigurasi runtime.';

CREATE TABLE IF NOT EXISTS public.certificate_counters (
  year     integer PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0
);
ALTER TABLE public.certificate_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.certificate_counters FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.next_certificate_number()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year integer := extract(year FROM (now() AT TIME ZONE 'Asia/Jakarta'))::integer;
  v_seq integer;
BEGIN
  INSERT INTO public.certificate_counters (year, last_seq) VALUES (v_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_seq = public.certificate_counters.last_seq + 1
  RETURNING last_seq INTO v_seq;
  RETURN 'RA-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END; $$;

CREATE OR REPLACE FUNCTION public.new_certificate_verification_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_hex text;
BEGIN
  LOOP
    v_hex := upper(encode(gen_random_bytes(6), 'hex'));
    v_hex := substr(v_hex, 1, 4) || '-' || substr(v_hex, 5, 4) || '-' || substr(v_hex, 9, 4);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.certificates WHERE verification_code = v_hex);
  END LOOP;
  RETURN v_hex;
END; $$;

-- Inti penerbitan: idempoten, satu sertifikat per Agent dan kursus, hanya untuk enrollment yang sudah selesai.
CREATE OR REPLACE FUNCTION public.issue_certificate_internal(p_agent_id uuid, p_course_id uuid)
RETURNS public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.certificates;
  v_enr  public.enrollments;
  v_c    public.courses;
  v_s    public.learning_settings;
  v_name text;
BEGIN
  SELECT * INTO v_cert FROM public.certificates WHERE agent_id = p_agent_id AND course_id = p_course_id;
  IF v_cert.id IS NOT NULL THEN
    RETURN v_cert;
  END IF;
  SELECT * INTO v_enr FROM public.enrollments WHERE agent_id = p_agent_id AND course_id = p_course_id AND status = 'completed';
  IF v_enr.id IS NULL THEN
    RAISE EXCEPTION 'certificates: kursus belum diselesaikan' USING ERRCODE = '23514';
  END IF;
  SELECT * INTO v_c FROM public.courses WHERE id = p_course_id;
  SELECT * INTO v_s FROM public.learning_settings WHERE id;
  SELECT full_name INTO v_name FROM public.agent_profiles WHERE user_id = p_agent_id AND deleted_at IS NULL;

  INSERT INTO public.certificates (agent_id, course_id, enrollment_id, certificate_number, verification_code, status, issued_at, snapshot)
  VALUES (p_agent_id, p_course_id, v_enr.id, public.next_certificate_number(), public.new_certificate_verification_code(), 'issued', now(),
    jsonb_build_object(
      'holder_name', COALESCE(NULLIF(btrim(v_name), ''), 'Agent RumahAgen'),
      'course_title', v_c.title,
      'organizer_type', v_c.organizer_type,
      'template', COALESCE(v_c.certificate_template, v_s.default_certificate_template),
      'signer_name', COALESCE(v_c.signer_name, v_s.default_signer_name),
      'signer_title', COALESCE(v_c.signer_title, v_s.default_signer_title),
      'signer_signature_path', CASE WHEN v_c.signer_name IS NOT NULL OR v_c.signer_title IS NOT NULL OR v_c.signer_signature_path IS NOT NULL
                                    THEN v_c.signer_signature_path ELSE v_s.default_signer_signature_path END,
      'partner_logo_paths', to_jsonb(v_c.partner_logo_paths)))
  ON CONFLICT (agent_id, course_id) DO NOTHING
  RETURNING * INTO v_cert;
  IF v_cert.id IS NULL THEN
    SELECT * INTO v_cert FROM public.certificates WHERE agent_id = p_agent_id AND course_id = p_course_id;
  END IF;
  RETURN v_cert;
END; $$;
REVOKE ALL ON FUNCTION public.issue_certificate_internal(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Agent mengunduh: terbitkan bila belum punya (backfill/terbit ulang). Hanya untuk kursus yang benar-benar selesai.
CREATE OR REPLACE FUNCTION public.ensure_my_certificate(p_course_id uuid)
RETURNS public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'ensure_my_certificate: harus login' USING ERRCODE = '42501';
  END IF;
  RETURN public.issue_certificate_internal(auth.uid(), p_course_id);
END; $$;
REVOKE ALL ON FUNCTION public.ensure_my_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_certificate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_issue_certificate(p_agent_id uuid, p_course_id uuid)
RETURNS public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.certificates;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('m04.certificate.manage') THEN
    RAISE EXCEPTION 'admin_issue_certificate: hanya staf yang boleh menerbitkan sertifikat' USING ERRCODE = '42501';
  END IF;
  v_cert := public.issue_certificate_internal(p_agent_id, p_course_id);
  PERFORM public.log_audit_event('m04.certificate.issue', 'certificates', v_cert.id, NULL, NULL,
    jsonb_build_object('agent_id', p_agent_id, 'course_id', p_course_id, 'certificate_number', v_cert.certificate_number));
  RETURN v_cert;
END; $$;
REVOKE ALL ON FUNCTION public.admin_issue_certificate(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_issue_certificate(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_certificate(p_certificate_id uuid, p_note text DEFAULT NULL)
RETURNS public.certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.certificates;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('m04.certificate.manage') THEN
    RAISE EXCEPTION 'revoke_certificate: hanya staf yang boleh mencabut sertifikat' USING ERRCODE = '42501';
  END IF;
  UPDATE public.certificates
     SET status = 'revoked', revoked_at = now(), revoked_by = auth.uid(), revoke_note = NULLIF(btrim(COALESCE(p_note, '')), '')
   WHERE id = p_certificate_id AND status = 'issued'
  RETURNING * INTO v_cert;
  IF v_cert.id IS NULL THEN
    RAISE EXCEPTION 'certificates: sertifikat tidak ditemukan atau sudah dicabut' USING ERRCODE = '23514';
  END IF;
  PERFORM public.log_audit_event('m04.certificate.revoke', 'certificates', v_cert.id, NULL, NULL,
    jsonb_build_object('certificate_number', v_cert.certificate_number, 'note', v_cert.revoke_note));
  RETURN v_cert;
END; $$;
REVOKE ALL ON FUNCTION public.revoke_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid, text) TO authenticated;

-- Verifikasi publik: hanya kolom aman. Kode dinormalkan (huruf besar, tanpa spasi).
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code text)
RETURNS TABLE (certificate_number text, status text, holder_name text, course_title text, issued_at timestamptz, revoked_at timestamptz, organizer_type text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.certificate_number::text, c.status, c.snapshot ->> 'holder_name', c.snapshot ->> 'course_title', c.issued_at, c.revoked_at, c.snapshot ->> 'organizer_type'
    FROM public.certificates c
   WHERE c.verification_code = upper(btrim(p_code))
   LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- Tabel tidak bisa ditulis langsung (penerbitan/pencabutan lewat fungsi di atas); baca tetap lewat policy certificates_select.
DROP POLICY IF EXISTS certificates_manage ON public.certificates;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.certificates FROM anon, authenticated;
REVOKE ALL ON public.certificates FROM anon;
GRANT SELECT ON public.certificates TO authenticated;

-- Backfill: sertifikat lama tanpa nomor + enrollment selesai tanpa sertifikat.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id, agent_id, course_id FROM public.certificates WHERE certificate_number IS NULL ORDER BY issued_at LOOP
    UPDATE public.certificates c SET
      certificate_number = public.next_certificate_number(),
      verification_code = public.new_certificate_verification_code(),
      snapshot = jsonb_build_object(
        'holder_name', COALESCE((SELECT NULLIF(btrim(full_name), '') FROM public.agent_profiles WHERE user_id = c.agent_id), 'Agent RumahAgen'),
        'course_title', (SELECT title FROM public.courses WHERE id = c.course_id), 'organizer_type', 'rumahagen', 'template', 'classic',
        'signer_name', (SELECT default_signer_name FROM public.learning_settings WHERE id),
        'signer_title', (SELECT default_signer_title FROM public.learning_settings WHERE id),
        'signer_signature_path', NULL, 'partner_logo_paths', '[]'::jsonb),
      enrollment_id = COALESCE(c.enrollment_id, (SELECT e.id FROM public.enrollments e WHERE e.agent_id = c.agent_id AND e.course_id = c.course_id))
    WHERE c.id = r.id;
  END LOOP;
  FOR r IN SELECT e.agent_id, e.course_id FROM public.enrollments e WHERE e.status = 'completed'
             AND NOT EXISTS (SELECT 1 FROM public.certificates c WHERE c.agent_id = e.agent_id AND c.course_id = e.course_id) LOOP
    PERFORM public.issue_certificate_internal(r.agent_id, r.course_id);
  END LOOP;
END $$;
ALTER TABLE public.certificates ALTER COLUMN certificate_number SET NOT NULL, ALTER COLUMN verification_code SET NOT NULL, ALTER COLUMN snapshot SET NOT NULL;

-- ═══ 4. LP: hadiah internal ═══
CREATE OR REPLACE FUNCTION public.grant_learning_reward(p_user_id uuid, p_amount numeric, p_source_type text, p_reference text, p_idempotency_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account uuid;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.learning_point_transactions WHERE idempotency_key = p_idempotency_key) THEN RETURN; END IF;
  INSERT INTO public.learning_point_accounts (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT id INTO v_account FROM public.learning_point_accounts WHERE user_id = p_user_id;
  INSERT INTO public.learning_point_transactions (account_id, user_id, transaction_type, amount, source_type, source_reference, idempotency_key)
  VALUES (v_account, p_user_id, 'earned', p_amount, p_source_type, p_reference, p_idempotency_key)
  ON CONFLICT (idempotency_key) DO NOTHING;
END; $$;
REVOKE ALL ON FUNCTION public.grant_learning_reward(uuid, numeric, text, text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_enrollment_learning_effects()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_s public.learning_settings;
BEGIN
  SELECT * INTO v_s FROM public.learning_settings WHERE id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.grant_learning_reward(NEW.agent_id, v_s.reward_lp_enrollment, 'm04_enrollment_reward', NEW.course_id::text, 'lp:enroll:' || NEW.id);
  ELSIF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    BEGIN
      PERFORM public.grant_learning_reward(NEW.agent_id, v_s.reward_lp_completion, 'm04_completion_reward', NEW.course_id::text, 'lp:complete:' || NEW.id);
      IF v_s.certificate_auto_issue THEN
        PERFORM public.issue_certificate_internal(NEW.agent_id, NEW.course_id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'enrollments: efek selesai belajar gagal untuk %: %', NEW.id, SQLERRM;  -- kelulusan tidak boleh gagal; sertifikat bisa diterbitkan lewat unduhan
    END;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_enrollment_learning_effects_ins ON public.enrollments;
CREATE TRIGGER trg_enrollment_learning_effects_ins AFTER INSERT ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.trg_enrollment_learning_effects();
DROP TRIGGER IF EXISTS trg_enrollment_learning_effects_upd ON public.enrollments;
CREATE TRIGGER trg_enrollment_learning_effects_upd AFTER UPDATE OF status ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.trg_enrollment_learning_effects();

CREATE OR REPLACE FUNCTION public.trg_quiz_pass_reward()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_agent uuid;
  v_amount numeric;
BEGIN
  IF NEW.passed IS NOT TRUE THEN RETURN NEW; END IF;
  SELECT agent_id INTO v_agent FROM public.enrollments WHERE id = NEW.enrollment_id;
  SELECT reward_lp_quiz_pass INTO v_amount FROM public.learning_settings WHERE id;
  IF v_agent IS NOT NULL THEN
    PERFORM public.grant_learning_reward(v_agent, v_amount, 'm04_quiz_pass_reward', NEW.quiz_id::text, 'lp:quizpass:' || NEW.enrollment_id || ':' || NEW.quiz_id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_quiz_pass_reward ON public.quiz_attempts;
CREATE TRIGGER trg_quiz_pass_reward AFTER INSERT ON public.quiz_attempts FOR EACH ROW EXECUTE FUNCTION public.trg_quiz_pass_reward();

-- Bonus saldo awal untuk akun baru (sekali; idempoten lewat kunci per akun).
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_agent_role_id UUID;
  v_inserted uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT id INTO v_agent_role_id FROM public.roles WHERE code = 'agent';

    INSERT INTO public.users (id, role_id, email_verified_at)
    VALUES (NEW.id, v_agent_role_id, NEW.email_confirmed_at)
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_inserted;

    IF v_inserted IS NOT NULL THEN
      BEGIN
        PERFORM public.grant_learning_reward(NEW.id, (SELECT signup_bonus_lp FROM public.learning_settings WHERE id), 'm04_signup_bonus', NULL, 'lp:signup:' || NEW.id);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_auth_user_sync: bonus LP awal gagal untuk %: %', NEW.id, SQLERRM;  -- pendaftaran tidak boleh gagal karena bonus
      END;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
      UPDATE public.users
      SET email_verified_at = NEW.email_confirmed_at, updated_at = now()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END; $$;

-- ═══ 5. Aturan kuis pihak ketiga ═══
CREATE OR REPLACE FUNCTION public.quiz_attempt_status(p_enrollment_id uuid, p_quiz_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_c      public.courses;
  v_s      public.learning_settings;
  v_agent  uuid;
  v_max    integer;
  v_cd     integer;
  v_cnt    integer;
  v_last   record;
  v_passed boolean;
  v_next   timestamptz;
BEGIN
  SELECT e.agent_id INTO v_agent FROM public.enrollments e WHERE e.id = p_enrollment_id;
  IF v_agent IS NULL OR (auth.uid() IS NOT NULL AND v_agent IS DISTINCT FROM auth.uid() AND NOT public.has_permission('m04.course_enrollment.view', v_agent)) THEN
    RAISE EXCEPTION 'quiz_attempt_status: enrollment tidak ditemukan atau bukan milik Anda' USING ERRCODE = '42501';
  END IF;
  SELECT c.* INTO v_c FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id WHERE e.id = p_enrollment_id;
  SELECT * INTO v_s FROM public.learning_settings WHERE id;
  SELECT count(*), bool_or(passed) INTO v_cnt, v_passed FROM public.quiz_attempts WHERE enrollment_id = p_enrollment_id AND quiz_id = p_quiz_id;
  SELECT attempted_at, passed INTO v_last FROM public.quiz_attempts WHERE enrollment_id = p_enrollment_id AND quiz_id = p_quiz_id ORDER BY attempted_at DESC LIMIT 1;
  IF v_c.organizer_type = 'rumahagen' THEN
    RETURN jsonb_build_object('limited', false, 'attempts_used', v_cnt, 'max_attempts', NULL, 'cooldown_minutes', 0, 'next_allowed_at', NULL, 'can_attempt', true);
  END IF;
  v_max := COALESCE(v_c.quiz_max_attempts, v_s.external_quiz_max_attempts);
  v_cd := COALESCE(v_c.quiz_cooldown_minutes, v_s.external_quiz_cooldown_minutes);
  IF v_last.attempted_at IS NOT NULL AND v_last.passed IS NOT TRUE AND v_cd > 0 THEN
    v_next := v_last.attempted_at + make_interval(mins => v_cd);
    IF v_next <= now() THEN v_next := NULL; END IF;
  END IF;
  RETURN jsonb_build_object('limited', true, 'attempts_used', v_cnt, 'max_attempts', v_max, 'cooldown_minutes', v_cd, 'next_allowed_at', v_next,
    'can_attempt', (v_max IS NULL OR v_cnt < v_max OR COALESCE(v_passed, false)) AND v_next IS NULL);
END; $$;
REVOKE ALL ON FUNCTION public.quiz_attempt_status(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_attempt_status(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_quiz_attempt_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_c    public.courses;
  v_s    public.learning_settings;
  v_max  integer;
  v_cd   integer;
  v_cnt  integer;
  v_last record;
  v_passed boolean;
BEGIN
  SELECT c.* INTO v_c FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id WHERE e.id = NEW.enrollment_id;
  IF v_c.id IS NULL OR v_c.organizer_type = 'rumahagen' THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.enrollment_id::text || ':' || NEW.quiz_id::text, 0));
  SELECT * INTO v_s FROM public.learning_settings WHERE id;
  v_max := COALESCE(v_c.quiz_max_attempts, v_s.external_quiz_max_attempts);
  v_cd := COALESCE(v_c.quiz_cooldown_minutes, v_s.external_quiz_cooldown_minutes);
  SELECT count(*), bool_or(passed) INTO v_cnt, v_passed FROM public.quiz_attempts WHERE enrollment_id = NEW.enrollment_id AND quiz_id = NEW.quiz_id;
  IF v_max IS NOT NULL AND v_cnt >= v_max AND NOT COALESCE(v_passed, false) THEN
    RAISE EXCEPTION 'quiz_attempts: batas % percobaan kuis sudah tercapai', v_max USING ERRCODE = '23514';
  END IF;
  SELECT attempted_at, passed INTO v_last FROM public.quiz_attempts WHERE enrollment_id = NEW.enrollment_id AND quiz_id = NEW.quiz_id ORDER BY attempted_at DESC LIMIT 1;
  IF v_cd > 0 AND v_last.attempted_at IS NOT NULL AND v_last.passed IS NOT TRUE AND v_last.attempted_at + make_interval(mins => v_cd) > now() THEN
    RAISE EXCEPTION 'quiz_attempts: kuis baru bisa dikerjakan lagi dalam % menit', ceil(extract(epoch FROM (v_last.attempted_at + make_interval(mins => v_cd) - now())) / 60)::int
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_enforce_quiz_attempt_rules ON public.quiz_attempts;
CREATE TRIGGER trg_enforce_quiz_attempt_rules BEFORE INSERT ON public.quiz_attempts FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_attempt_rules();

-- ═══ 6. Bucket privat logo mitra dan tanda tangan ═══
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificate-assets', 'certificate-assets', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
