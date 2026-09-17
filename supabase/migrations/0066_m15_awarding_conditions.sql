-- 0066_m15_awarding_conditions.sql
-- Fase 3 (lanjutan 0064/0065): AWARDING_CONDITION_GROUPS + AWARDING_
-- CONDITIONS + AWARDING_PREREQUISITES — penutup config engine M15. Sumber
-- kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, TANPA
-- deviasi (dan TANPA menambah CHECK yang tidak dievidence:
-- `group_operator`, `condition_type`, `operator` semuanya TEXT/VARCHAR
-- bebas persis apa adanya di sumber — logika evaluasi AND/OR/operator
-- pembanding dijalankan di lapisan aplikasi, bukan dikunci di database).
-- TIDAK ADA permission baru — memakai `m15.awarding_path_rule.configure`
-- yang sama dari 0064.

CREATE TABLE IF NOT EXISTS public.awarding_condition_groups (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awarding_rule_version_id  UUID NOT NULL REFERENCES public.awarding_rule_versions(id) ON DELETE CASCADE,
  group_operator            TEXT NOT NULL DEFAULT 'AND',
  sequence_no               INT NOT NULL DEFAULT 0 CHECK (sequence_no >= 0),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.awarding_condition_groups IS 'Sumber: STEP10-D entity AWARDING_CONDITION_GROUPS.';

CREATE TABLE IF NOT EXISTS public.awarding_conditions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_group_id   UUID NOT NULL REFERENCES public.awarding_condition_groups(id) ON DELETE CASCADE,
  condition_type       VARCHAR(100) NOT NULL,
  operator             VARCHAR(50) NOT NULL,
  expected_value       JSONB,
  sequence_no          INT NOT NULL DEFAULT 0 CHECK (sequence_no >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.awarding_conditions IS 'Sumber: STEP10-D entity AWARDING_CONDITIONS.';

CREATE TABLE IF NOT EXISTS public.awarding_prerequisites (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awarding_path_version_id    UUID NOT NULL REFERENCES public.awarding_path_versions(id) ON DELETE CASCADE,
  prerequisite_type           VARCHAR(100) NOT NULL,
  prerequisite_reference      TEXT,
  requirement_definition      JSONB NOT NULL DEFAULT '{}'::jsonb,
  sequence_no                 INT NOT NULL DEFAULT 0 CHECK (sequence_no >= 0),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.awarding_prerequisites IS
  'Sumber: STEP10-D entity AWARDING_PREREQUISITES. `prerequisite_reference` mengikuti pola field longgar seperti url_redirects.entity_id (tanpa FK fisik) — sebuah prerequisite bisa merujuk ke course (M04), title lain (M15), atau entity apa pun yang requirement_definition-nya jelaskan, tanpa dikunci ke satu tabel spesifik.';

ALTER TABLE public.awarding_condition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awarding_conditions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awarding_prerequisites    ENABLE ROW LEVEL SECURITY;

CREATE POLICY awarding_condition_groups_manage ON public.awarding_condition_groups
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));

CREATE POLICY awarding_conditions_manage ON public.awarding_conditions
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));

CREATE POLICY awarding_prerequisites_manage ON public.awarding_prerequisites
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));
