-- 0027_m04_m15_evidence_evaluation_invocation.sql
-- Menutup D13-03: "M04 governed evidence → M15 Qualification Evaluation/Award
-- is valid, but endpoint-level field/contract traceability is not uniformly
-- frozen." Dua fungsi di sini ADALAH kontrak field yang dibekukan: pipeline
-- session_completion_outcomes (M04, 0022) → qualification_evidence (M15,
-- 0026) → qualification_evaluations (M15, 0026), dengan field CONSISTEN
-- (source_type/source_reference dipakai identik di learning_point_transactions
-- 0023, qualification_evidence 0026, DAN dipakai lagi di sini) alih-alih tiap
-- pemanggil bebas menafsirkan sendiri field mana yang berisi apa.

-- ── (M04→M15) capture_qualification_evidence_from_session ──
-- Realisasi fisik pertama pipeline: mengambil satu session_completion_outcomes
-- (M04) dan menyalinnya jadi satu baris qualification_evidence (M15) dengan
-- field payload yang SERAGAM (result/completion_policy_version/completed_at —
-- nama key JSON yang SAMA PERSIS dengan nama kolom sumbernya di 0022, bukan
-- direname bebas), supaya siapa pun yang membaca evidence_payload nanti tidak
-- perlu menebak-nebak field mana yang berisi apa.
CREATE OR REPLACE FUNCTION public.capture_qualification_evidence_from_session(
  p_completion_outcome_id UUID
)
RETURNS public.qualification_evidence
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_outcome    public.session_completion_outcomes;
  v_enrollment public.session_enrollments;
  v_evidence   public.qualification_evidence;
BEGIN
  SELECT * INTO v_outcome FROM public.session_completion_outcomes WHERE id = p_completion_outcome_id;
  IF v_outcome.id IS NULL THEN
    RAISE EXCEPTION 'capture_qualification_evidence_from_session: completion_outcome % tidak ditemukan', p_completion_outcome_id;
  END IF;

  SELECT * INTO v_enrollment FROM public.session_enrollments WHERE id = v_outcome.session_enrollment_id;

  IF NOT public.has_permission('m15.qualification.evaluate', v_enrollment.agent_id) THEN
    RAISE EXCEPTION 'capture_qualification_evidence_from_session: tidak punya permission m15.qualification.evaluate untuk user %', v_enrollment.agent_id;
  END IF;

  INSERT INTO public.qualification_evidence (
    user_id, evidence_type, source_type, source_reference, evidence_payload, captured_at
  ) VALUES (
    v_enrollment.agent_id,
    'session_completion',
    'm04.session_completion_outcomes',
    p_completion_outcome_id::text,
    jsonb_build_object(
      'session_enrollment_id', v_outcome.session_enrollment_id,
      'completion_policy_version', v_outcome.completion_policy_version,
      'result', v_outcome.result,
      'completed_at', v_outcome.completed_at
    ),
    v_outcome.completed_at
  )
  RETURNING * INTO v_evidence;

  RETURN v_evidence;
END;
$$;

COMMENT ON FUNCTION public.capture_qualification_evidence_from_session IS
  'Separuh pertama realisasi fisik D13-03. evidence_payload memakai key JSON yang sama persis dengan nama kolom session_completion_outcomes sumbernya — ini kontrak field yang dibekukan, bukan pemetaan bebas per pemanggil.';

-- ── (M15) evaluate_qualification ──
-- Separuh kedua: membaca evidence (field contract yang sama dari fungsi di
-- atas), menghasilkan qualification_evaluations, dan menautkan balik
-- qualification_evidence.qualification_evaluation_id (FK yang ditambahkan di
-- 0026 — lihat catatan di sana).
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

  IF NOT public.has_permission('m15.qualification.evaluate', v_evidence.user_id) THEN
    RAISE EXCEPTION 'evaluate_qualification: tidak punya permission m15.qualification.evaluate untuk user %', v_evidence.user_id;
  END IF;

  -- Kontrak field D13-03: baca key 'result' dari evidence_payload (ditulis
  -- capture_qualification_evidence_from_session di atas dengan nama yang sama
  -- persis) — bukan re-parsing bebas tiap pemanggil. 'qualified' hanya kalau
  -- completion result eksplisit menandakan sukses; NULL → 'pending' (evidence
  -- ada tapi belum ada hasil pasti); selain itu → 'not_qualified'.
  v_result := CASE
    WHEN v_evidence.evidence_payload->>'result' IN ('passed','qualified','complete','completed') THEN 'qualified'
    WHEN v_evidence.evidence_payload->>'result' IS NULL THEN 'pending'
    ELSE 'not_qualified'
  END;

  INSERT INTO public.qualification_evaluations (
    user_id, result, evaluator_type, evaluator_reference, provenance
  ) VALUES (
    v_evidence.user_id, v_result, 'system_automated', p_evaluator_reference,
    jsonb_build_object('qualification_evidence_id', v_evidence.id, 'evidence_source_reference', v_evidence.source_reference)
  )
  RETURNING * INTO v_eval;

  UPDATE public.qualification_evidence
  SET qualification_evaluation_id = v_eval.id
  WHERE id = v_evidence.id;

  PERFORM public.log_audit_event(
    p_action      := 'm15.qualification.evaluate',
    p_entity_type := 'qualification_evaluations',
    p_entity_id   := v_eval.id,
    p_new_value   := jsonb_build_object('user_id', v_evidence.user_id, 'result', v_result)
  );

  RETURN v_eval;
END;
$$;

COMMENT ON FUNCTION public.evaluate_qualification IS
  'Separuh kedua realisasi fisik D13-03. `awarding_path_version_id`/`awarding_rule_version_id` pada baris yang dihasilkan TETAP NULL (lihat catatan 0026) — evaluasi ini valid secara field-contract, tapi belum terikat mesin konfigurasi jalur/aturan formal. Award (award_instances) tetap lewat RLS+trigger biasa di 0026, bukan fungsi tambahan di sini — D13-03 lingkupnya evidence→evaluation, bukan mekanisme award itu sendiri.';
