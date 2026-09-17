-- 0065_m15_awarding_rules.sql
-- Fase 3 (lanjutan 0064): AWARDING_RULE_VERSIONS + AWARDING_PATH_RULES.
-- Sumber kolom: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- tanpa deviasi. TIDAK ADA permission baru — memakai
-- `m15.awarding_path_rule.configure` yang sama dari 0064.

CREATE TABLE IF NOT EXISTS public.awarding_rule_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code         VARCHAR(100) NOT NULL,
  version_no        INT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft',
  effective_from    TIMESTAMPTZ,
  effective_to      TIMESTAMPTZ,
  rule_definition   JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rule_code, version_no)
);

COMMENT ON TABLE public.awarding_rule_versions IS
  'Sumber: STEP10-D entity AWARDING_RULE_VERSIONS. TIDAK terikat langsung ke satu awarding_path — satu Rule Version bisa dipakai ulang lintas Path lewat awarding_path_rules (N:N di bawah), sesuai catatan STEP10-D "awarding_path_rules preserves reusable N:N Path Version <-> Rule Version composition". Inilah tabel yang ditunggu `qualification_evaluations.awarding_rule_version_id`/`award_instances.awarding_rule_version_id` — FK retroaktifnya ditutup di 0069. UNIQUE(rule_code, version_no) ditambahkan untuk integritas referensial.';

CREATE TABLE IF NOT EXISTS public.awarding_path_rules (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awarding_path_version_id    UUID NOT NULL REFERENCES public.awarding_path_versions(id) ON DELETE CASCADE,
  awarding_rule_version_id    UUID NOT NULL REFERENCES public.awarding_rule_versions(id) ON DELETE RESTRICT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (awarding_path_version_id, awarding_rule_version_id)
);

COMMENT ON TABLE public.awarding_path_rules IS
  'Sumber: STEP10-D entity AWARDING_PATH_RULES. Junction N:N Path Version <-> Rule Version. `ON DELETE RESTRICT` ke awarding_rule_versions (bukan CASCADE) — Rule Version yang masih dipakai satu Path Version manapun TIDAK BOLEH terhapus begitu saja (beda dari CASCADE ke awarding_path_version_id yang pemiliknya jelas satu arah). UNIQUE mencegah pasangan Path Version-Rule Version yang sama didaftarkan dua kali.';

ALTER TABLE public.awarding_rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awarding_path_rules    ENABLE ROW LEVEL SECURITY;

CREATE POLICY awarding_rule_versions_manage ON public.awarding_rule_versions
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));

CREATE POLICY awarding_path_rules_manage ON public.awarding_path_rules
  FOR ALL USING (public.has_permission('m15.awarding_path_rule.configure'))
  WITH CHECK (public.has_permission('m15.awarding_path_rule.configure'));
