-- 0128_m15_close_self_qualification_and_award_gaps.sql
-- Menutup celah M15 yang dibuktikan lewat uji rollback pada DB live (2026-09-24) saat memindai
-- wireframe Fase E. Seorang Agent (role agent, scope 'own' pada m15.qualification.evaluate,
-- m15.award.award, m15.award.revoke/manage) ternyata bisa:
--   a. membuat evaluasi kualifikasi 'qualified' untuk dirinya sendiri (evaluator_type bebas, mis. "Tim RumahAgen");
--   b. membuat evidence berisi {"result":"passed"} lalu memanggil evaluate_qualification() -> 'qualified';
--   c. memberi dirinya title apa pun yang punya authority scope aktif (INSERT award_instances);
--   d. memulihkan (restore) award yang sudah dicabut staf (UPDATE award_instances);
--   e. menampilkan di profil publik title yang tidak pernah diberikan (title_presentations).
-- Padahal master matrix M15 dan STEP13-E §26 menyatakan qualification dievaluasi dari evidence oleh
-- pihak berwenang, dan Award "requires applicable Authority/Scope Binding; no Issuer Role".
--
-- Model setelah migration ini:
--   * Agent (dan mitra/instruktur) HANYA mengajukan evidence miliknya (source_type upload|external_link,
--     tanpa mengikat ke evaluation).
--   * Evaluasi (manual maupun evaluate_qualification) dan Award (INSERT/UPDATE/restore) hanya untuk staf
--     (izin scope 'all') atau konteks server tepercaya (auth.uid() NULL).
--   * evaluate_qualification hanya meng-otomatis-lulus-kan evidence yang ditangkap SISTEM dari M04
--     (source_type 'm04.session_completion_outcomes'); evidence manual -> 'pending' menunggu evaluasi staf.
--   * evaluator_type dibatasi: system_automated | staff | instructor (tabel masih kosong saat migration ini).
--   * Award yang mengacu evaluation harus untuk user yang sama dan berhasil 'qualified'.
--   * Presentation title hanya untuk title yang diberikan dan berstatus active/restored; saat award dicabut
--     atau kedaluwarsa presentation-nya otomatis dinonaktifkan.

-- ── 1. Evaluasi: hanya staf ──
DROP POLICY IF EXISTS qualification_evaluations_insert ON public.qualification_evaluations;
CREATE POLICY qualification_evaluations_insert ON public.qualification_evaluations
  FOR INSERT WITH CHECK (public.has_permission('m15.qualification.evaluate'));

ALTER TABLE public.qualification_evaluations
  ADD CONSTRAINT qualification_evaluations_evaluator_type_check
  CHECK (evaluator_type IN ('system_automated', 'staff', 'instructor'));

-- ── 2. evaluate_qualification: izin staf/server + hanya evidence sistem yang bisa otomatis lulus ──
CREATE OR REPLACE FUNCTION public.evaluate_qualification(
  p_evidence_id          UUID,
  p_evaluator_reference  TEXT DEFAULT NULL
)
RETURNS public.qualification_evaluations
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evidence public.qualification_evidence;
  v_result   TEXT;
  v_eval     public.qualification_evaluations;
BEGIN
  SELECT * INTO v_evidence FROM public.qualification_evidence WHERE id = p_evidence_id;
  IF v_evidence.id IS NULL THEN
    RAISE EXCEPTION 'evaluate_qualification: evidence % tidak ditemukan', p_evidence_id;
  END IF;
  IF auth.uid() IS NOT NULL AND NOT public.has_permission('m15.qualification.evaluate') THEN
    RAISE EXCEPTION 'evaluate_qualification: tidak punya permission m15.qualification.evaluate (hanya staf yang boleh mengevaluasi)'
      USING ERRCODE = '42501';
  END IF;
  -- Hanya evidence yang ditangkap sistem dari M04 yang dipercaya untuk otomatis 'qualified'.
  -- Evidence manual (diajukan pengguna) selalu 'pending' sampai staf memutuskan lewat evaluasi manual.
  v_result := CASE
    WHEN v_evidence.source_type <> 'm04.session_completion_outcomes' THEN 'pending'
    WHEN v_evidence.evidence_payload->>'result' IN ('passed','qualified','complete','completed') THEN 'qualified'
    WHEN v_evidence.evidence_payload->>'result' IS NULL THEN 'pending'
    ELSE 'not_qualified'
  END;
  INSERT INTO public.qualification_evaluations (user_id, result, evaluator_type, evaluator_reference, provenance)
  VALUES (
    v_evidence.user_id, v_result, 'system_automated', p_evaluator_reference,
    jsonb_build_object('qualification_evidence_id', v_evidence.id, 'evidence_source_reference', v_evidence.source_reference)
  )
  RETURNING * INTO v_eval;
  UPDATE public.qualification_evidence SET qualification_evaluation_id = v_eval.id WHERE id = v_evidence.id;
  PERFORM public.log_audit_event(
    p_action      := 'm15.qualification.evaluate',
    p_entity_type := 'qualification_evaluations',
    p_entity_id   := v_eval.id,
    p_new_value   := jsonb_build_object('user_id', v_evidence.user_id, 'result', v_result)
  );
  RETURN v_eval;
END;
$$;

-- ── 3. Evidence: pengguna biasa hanya boleh upload/external_link dan tidak boleh mengikat ke evaluation ──
CREATE OR REPLACE FUNCTION public.enforce_qualification_evidence_submitter_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya berlaku bagi klien terautentikasi biasa yang bukan staf. Fungsi SECURITY DEFINER
  -- (capture_qualification_evidence_from_session) berjalan sebagai pemilik fungsi dan tidak terkena.
  IF current_user IN ('authenticated', 'anon') AND NOT public.has_permission('m15.qualification.evaluate') THEN
    IF NEW.source_type NOT IN ('upload', 'external_link') THEN
      RAISE EXCEPTION 'qualification_evidence: bukti yang diajukan pengguna hanya boleh bersumber upload atau external_link (source_type % ditolak)', NEW.source_type
        USING ERRCODE = '42501';
    END IF;
    IF NEW.qualification_evaluation_id IS NOT NULL THEN
      RAISE EXCEPTION 'qualification_evidence: pengguna tidak boleh mengikat bukti ke evaluasi (hanya evaluasi oleh staf/sistem)'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_qualification_evidence_submitter_rules
  BEFORE INSERT ON public.qualification_evidence
  FOR EACH ROW EXECUTE FUNCTION public.enforce_qualification_evidence_submitter_rules();

-- ── 4. Award: INSERT/UPDATE hanya staf; acuan evaluation harus valid ──
DROP POLICY IF EXISTS award_instances_insert ON public.award_instances;
CREATE POLICY award_instances_insert ON public.award_instances
  FOR INSERT WITH CHECK (public.has_permission('m15.award.award'));

DROP POLICY IF EXISTS award_instances_update ON public.award_instances;
CREATE POLICY award_instances_update ON public.award_instances
  FOR UPDATE USING (public.has_permission('m15.award.revoke') OR public.has_permission('m15.award.manage'))
  WITH CHECK (public.has_permission('m15.award.revoke') OR public.has_permission('m15.award.manage'));

CREATE OR REPLACE FUNCTION public.enforce_award_evaluation_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qualification_evaluation_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.qualification_evaluations qe
      WHERE qe.id = NEW.qualification_evaluation_id AND qe.user_id = NEW.user_id AND qe.result = 'qualified'
    ) THEN
      RAISE EXCEPTION 'award_instances: qualification_evaluation_id harus evaluasi berstatus qualified milik user yang sama'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_award_evaluation_reference
  BEFORE INSERT ON public.award_instances
  FOR EACH ROW EXECUTE FUNCTION public.enforce_award_evaluation_reference();

-- ── 5. Presentation: hanya title yang diberikan; dinonaktifkan otomatis saat award dicabut/kedaluwarsa ──
CREATE OR REPLACE FUNCTION public.enforce_title_presentation_requires_award()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active IS TRUE AND current_user IN ('authenticated', 'anon') AND NOT public.has_permission('m15.title_presentation.manage') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.award_instances ai
      WHERE ai.user_id = NEW.user_id AND ai.title_definition_id = NEW.title_definition_id AND ai.status IN ('active', 'restored')
    ) THEN
      RAISE EXCEPTION 'title_presentations: title hanya bisa ditampilkan bila award-nya berstatus active atau restored'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_title_presentation_requires_award
  BEFORE INSERT OR UPDATE ON public.title_presentations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_title_presentation_requires_award();

CREATE OR REPLACE FUNCTION public.deactivate_title_presentation_on_award_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('revoked', 'expired') AND OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.title_presentations
    SET active = false, updated_at = now()
    WHERE user_id = NEW.user_id AND title_definition_id = NEW.title_definition_id AND active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_deactivate_presentation_on_award_end
  AFTER UPDATE OF status ON public.award_instances
  FOR EACH ROW EXECUTE FUNCTION public.deactivate_title_presentation_on_award_end();
