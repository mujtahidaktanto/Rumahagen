-- 0067_m15_award_qualifying_paths.sql
-- Fase 3 (lanjutan 0064-0066): AWARD_QUALIFYING_PATHS — provenance yang
-- menaut satu award_instances (0026) ke awarding_path_version + (opsional)
-- qualification_evaluations yang menghasilkannya. Sumber kolom: STEP10-D_
-- ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa deviasi.
--
-- TIDAK ADA permission baru — award_qualifying_paths murni metadata
-- provenance MILIK satu award_instances, jadi otorisasinya diturunkan
-- LANGSUNG dari permission award_instances yang sudah ada
-- (`m15.award.award` untuk INSERT, `m15.award.manage` untuk SELECT/UPDATE
-- oversight) lewat join ke award_instances.user_id — pola sama seperti
-- listing_photos/0047 join ke listings.agent_id, BUKAN permission baru
-- untuk resource yang kepemilikannya sudah jelas dari induknya.

CREATE TABLE IF NOT EXISTS public.award_qualifying_paths (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_instance_id             UUID NOT NULL REFERENCES public.award_instances(id) ON DELETE CASCADE,
  awarding_path_version_id      UUID NOT NULL REFERENCES public.awarding_path_versions(id) ON DELETE RESTRICT,
  qualification_evaluation_id   UUID REFERENCES public.qualification_evaluations(id) ON DELETE SET NULL,
  provenance                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.award_qualifying_paths IS
  'Sumber: STEP10-D entity AWARD_QUALIFYING_PATHS. Melengkapi award_instances.awarding_path_version_id/awarding_rule_version_id (NULLABLE, FK ditutup di 0069) dengan jejak provenance eksplisit: baris di sini mencatat PATH VERSION mana + EVALUATION mana yang menghasilkan award tertentu, terpisah dari kolom ringkas di award_instances sendiri.';

ALTER TABLE public.award_qualifying_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY award_qualifying_paths_select ON public.award_qualifying_paths
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.award_instances ai
      WHERE ai.id = award_qualifying_paths.award_instance_id
        AND (ai.user_id = auth.uid() OR public.has_permission('m15.award.manage', ai.user_id))
    )
  );

CREATE POLICY award_qualifying_paths_insert ON public.award_qualifying_paths
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.award_instances ai
      WHERE ai.id = award_qualifying_paths.award_instance_id
        AND public.has_permission('m15.award.award', ai.user_id)
    )
  );
