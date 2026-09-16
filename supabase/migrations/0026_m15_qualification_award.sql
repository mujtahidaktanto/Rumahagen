-- 0026_m15_qualification_award.sql
-- Prasyarat fisik untuk D13-03 (0027 memakai tabel di sini) — realisasi fisik
-- 6 permission M15 yang sudah di-seed sejak Tahap 1:
-- m15.qualification.{administer,evaluate}, m15.award.{award,revoke,manage},
-- m15.title_authority_scope_binding.configure.
--
-- Sumber kolom: STEP10-D, entity TITLE_DEFINITIONS/TITLE_AUTHORITY_SCOPES/
-- QUALIFICATION_EVIDENCE/QUALIFICATION_EVALUATIONS/AWARD_INSTANCES (module M15).
--
-- KEPUTUSAN STRUKTURAL PENTING (baca sebelum menambah data): STEP10-D
-- mensyaratkan QUALIFICATION_EVALUATIONS.awarding_path_version_id DAN
-- .awarding_rule_version_id sebagai FK NOT NULL ke awarding_path_versions/
-- awarding_rule_versions — begitu juga AWARD_INSTANCES. KEDUA tabel target itu
-- (plus 6 tabel konfigurasi terkait: AWARDING_CONDITIONS,
-- AWARDING_CONDITION_GROUPS, AWARDING_PATHS, AWARDING_PATH_RULES,
-- AWARDING_PREREQUISITES, AWARD_QUALIFYING_PATHS) adalah MESIN KONFIGURASI
-- kondisi/jalur kelulusan yang JAUH LEBIH BESAR dari lingkup D13-03 ("field/
-- contract level traceability" evidence→evaluation→award) — dan TIDAK
-- disebut sama sekali di residual manapun pada checklist saat ini.
--
-- KEPUTUSAN: kedua kolom itu DILEBARKAN jadi NULLABLE tanpa FK di sini (deviasi
-- terdokumentasi dari NOT NULL sumber, pola sama seperti pelebaran action_code
-- di 0003) — NULL berarti "belum terikat ke path/rule versi formal". Mesin
-- konfigurasi awarding path/rule adalah RESIDUAL TERPISAH untuk masa depan
-- (belum punya nomor di checklist manapun) — bukan diam-diam diabaikan,
-- didokumentasikan eksplisit di sini supaya kelihatan sebagai TODO, bukan
-- dianggap "sudah lengkap".
--
-- URUTAN TABEL dalam file ini SENGAJA: title_definitions → title_authority_scopes
-- → qualification_evaluations → qualification_evidence → award_instances —
-- qualification_evidence.qualification_evaluation_id butuh qualification_evaluations
-- sudah ada dulu (STEP10-D sendiri tidak menulis FK eksplisit di kolom itu, tapi
-- karena kedua tabel ada di migration yang sama, FK ditambahkan untuk integritas
-- referensial — satu-satunya penambahan di luar STEP10-D literal pada file ini).

CREATE TABLE IF NOT EXISTS public.title_definitions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(100) UNIQUE NOT NULL,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','inactive','retired')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.title_authority_scopes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_definition_id  UUID NOT NULL REFERENCES public.title_definitions(id) ON DELETE CASCADE,
  scope_type           VARCHAR(100) NOT NULL,
  scope_reference      TEXT,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.title_authority_scopes IS
  'Sumber: STEP10-D entity TITLE_AUTHORITY_SCOPES. Menutup makna "Requires applicable Authority/Scope Binding; no Issuer Role" di master matrix M15 Award — award HANYA valid kalau ada baris active di sini yang cocok untuk title terkait (ditegakkan trigger di award_instances di bawah), bukan otorisasi berdasarkan role generik semata.';

CREATE TABLE IF NOT EXISTS public.qualification_evaluations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  awarding_path_version_id    UUID,  -- NULLABLE, FK DITUNDA — lihat catatan keputusan di atas
  awarding_rule_version_id    UUID,  -- NULLABLE, FK DITUNDA — lihat catatan keputusan di atas
  result                      TEXT NOT NULL CHECK (result IN ('qualified','not_qualified','pending','failed','revoked')),
  evaluation_time             TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluator_type               VARCHAR(100) NOT NULL,
  evaluator_reference           TEXT,
  provenance                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.qualification_evaluations IS
  'Sumber: STEP10-D entity QUALIFICATION_EVALUATIONS. `result` bertipe sama (CHECK enum eksplisit) dengan session_attendance_evaluations.result yang bertipe TEXT bebas — DI SINI STEP10-D justru MENGUNCI enum result, beda dari tabel M04 evidence — dipertahankan apa adanya (tidak dipaksa seragam ke TEXT bebas, karena D13-03 minta keseragaman KONTRAK FIELD level nama/tipe kolom antar M04→M15, bukan keseragaman constraint). Lihat 0027 untuk realisasi fisik pipeline evidence→evaluation ini.';

CREATE TABLE IF NOT EXISTS public.qualification_evidence (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  qualification_evaluation_id   UUID REFERENCES public.qualification_evaluations(id) ON DELETE SET NULL,
  evidence_type                 VARCHAR(100) NOT NULL,
  source_type                   VARCHAR(100) NOT NULL,
  source_reference              TEXT NOT NULL,
  evidence_payload              JSONB,
  captured_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.qualification_evidence IS
  'Sumber: STEP10-D entity QUALIFICATION_EVIDENCE. `source_type`/`source_reference` adalah field yang SAMA PERSIS namanya dengan learning_point_transactions.source_type/source_reference (0023) dan mirip session_participation_evidence — pola field konsisten lintas modul (bagian dari realisasi D13-03), memudahkan menelusuri asal evidence apa pun (dari M04 session, dari M14 commercial, dst.) tanpa nama kolom berbeda-beda per modul.';

CREATE TABLE IF NOT EXISTS public.award_instances (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_definition_id         UUID NOT NULL REFERENCES public.title_definitions(id) ON DELETE RESTRICT,
  awarding_path_version_id    UUID,  -- NULLABLE, FK DITUNDA — sama seperti qualification_evaluations
  awarding_rule_version_id    UUID,  -- NULLABLE, FK DITUNDA — sama seperti qualification_evaluations
  qualification_evaluation_id UUID REFERENCES public.qualification_evaluations(id) ON DELETE SET NULL,
  status                       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked','restored')),
  issued_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                   TIMESTAMPTZ,
  revoked_at                   TIMESTAMPTZ,
  restored_at                  TIMESTAMPTZ,
  historical_snapshot          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.award_instances IS
  'Sumber: STEP10-D entity AWARD_INSTANCES. Master matrix M15 Award: "Requires applicable Authority/Scope Binding; no Issuer Role" — ditegakkan trigger di bawah (BUKAN cukup role Superadmin/Admin/Manager/Agent-OWN semata, HARUS ada title_authority_scopes aktif yang cocok).';

-- ── Trigger: Award butuh Authority/Scope Binding aktif (master matrix M15) ──
CREATE OR REPLACE FUNCTION public.enforce_award_requires_authority_scope()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.title_authority_scopes tas
    WHERE tas.title_definition_id = NEW.title_definition_id AND tas.status = 'active'
  ) THEN
    RAISE EXCEPTION 'award_instances: title_definition_id % tidak punya title_authority_scopes aktif (master matrix M15 Award: "Requires applicable Authority/Scope Binding")', NEW.title_definition_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_award_requires_authority_scope
  BEFORE INSERT ON public.award_instances
  FOR EACH ROW EXECUTE FUNCTION public.enforce_award_requires_authority_scope();

-- ── RLS ── permission SUDAH ADA di seed 0009 sejak Tahap 1. Tidak ada
-- permission baru dibuat di migration ini.

ALTER TABLE public.title_definitions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_authority_scopes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_evidence    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_instances           ENABLE ROW LEVEL SECURITY;

-- title_definitions/title_authority_scopes — katalog referensi, dibaca publik
-- (siapa pun perlu lihat title apa saja yang ada), dikelola lewat permission
-- title_authority_scope_binding.configure (Superadmin/Admin/Manager ALL saja).
CREATE POLICY title_definitions_select_public ON public.title_definitions
  FOR SELECT USING (true);

CREATE POLICY title_definitions_manage ON public.title_definitions
  FOR ALL USING (public.has_permission('m15.title_authority_scope_binding.configure'))
  WITH CHECK (public.has_permission('m15.title_authority_scope_binding.configure'));

CREATE POLICY title_authority_scopes_select_public ON public.title_authority_scopes
  FOR SELECT USING (true);

CREATE POLICY title_authority_scopes_manage ON public.title_authority_scopes
  FOR ALL USING (public.has_permission('m15.title_authority_scope_binding.configure'))
  WITH CHECK (public.has_permission('m15.title_authority_scope_binding.configure'));

-- qualification_evaluations — Administer/evaluate: Superadmin/Admin/Manager
-- ALL, Agent/Developer Partner/Instructor OWN (lihat baris M15 master matrix).
CREATE POLICY qualification_evaluations_select ON public.qualification_evaluations
  FOR SELECT USING (public.has_permission('m15.qualification.administer', user_id));

CREATE POLICY qualification_evaluations_insert ON public.qualification_evaluations
  FOR INSERT WITH CHECK (public.has_permission('m15.qualification.evaluate', user_id));

CREATE POLICY qualification_evidence_select ON public.qualification_evidence
  FOR SELECT USING (public.has_permission('m15.qualification.administer', user_id));

CREATE POLICY qualification_evidence_insert ON public.qualification_evidence
  FOR INSERT WITH CHECK (public.has_permission('m15.qualification.administer', user_id));

-- award_instances — Award/revoke/manage: Superadmin/Admin/Manager ALL, Agent
-- OWN (semua role lain NONE — lihat master matrix M15 Award).
CREATE POLICY award_instances_select ON public.award_instances
  FOR SELECT USING (
    status = 'active'  -- award aktif = pencapaian, wajar terlihat publik (mis. di profil agent)
    OR public.has_permission('m15.award.manage', user_id)
  );

CREATE POLICY award_instances_insert ON public.award_instances
  FOR INSERT WITH CHECK (public.has_permission('m15.award.award', user_id));

CREATE POLICY award_instances_update ON public.award_instances
  FOR UPDATE USING (
    public.has_permission('m15.award.revoke', user_id)
    OR public.has_permission('m15.award.manage', user_id)
  );
