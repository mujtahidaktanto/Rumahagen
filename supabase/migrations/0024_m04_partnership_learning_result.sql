-- 0024_m04_partnership_learning_result.sql
-- Menutup sisa residual R-08: "...dan realisasi Partnership Learning."
--
-- KEPUTUSAN ENGINEERING (didokumentasikan eksplisit — TIDAK ada baris
-- "Partnership Learning Result" di STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv
-- 50-baris, dan TIDAK ada entity "PARTNERSHIP_LEARNING_RESULT" di
-- STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv manapun — dicek
-- eksplisit ke seluruh corpus. Gate PRE-00-F §51 sendiri mengonfirmasi status
-- ini: "physical Partnership Learning Result realization: CONTROLLED... no
-- new physical table is inferred; exact physical authorization remains
-- downstream." Migration inilah realisasi "downstream" yang dimaksud.):
--
-- 1. ROLE DIRECTION — diambil PERSIS dari Gate §51 (Q-M04-H-01), bukan
--    dikarang bebas: Superadmin=BYPASS(ALL), Developer Partner=ALL (dalam
--    scope partner-nya sendiri — diterjemahkan ke OWN di model has_permission
--    kita, karena tidak ada konsep "partner domain" terpisah dari user_id di
--    skema saat ini), SEMUA role lain (Admin/Manager/Agent/Instructor/Buyer)=NONE.
--    Ini pola paling restriktif yang pernah dibuat sejauh Tahap 1-5 — bahkan
--    Admin/Manager tidak punya akses, cuma Superadmin + pemilik.
--
-- 2. SKEMA TABEL — didesain dari deskripsi wireframe ADM-LRN-013
--    ("Validate partner learning result while preserving partner provenance",
--    field wajib: "partner provenance") di
--    docs/design/wireframes/WF-04-learning-economy/WF-04.02-to-04.06-full-version/WF-04.05/Docs/FIELD_SEMANTIC_COVERAGE.csv
--    — kolom MINIMAL yang cukup merepresentasikan "hasil pembelajaran mitra +
--    provenance", bukan skema penuh (tidak ada spesifikasi field lengkap di
--    manapun). Kalau kebutuhan field lebih detail muncul nyata nanti, itu
--    revisi migration ini, bukan diasumsikan sekarang (pola sama seperti
--    ai_providers/0015 yang tidak diberi data melebihi yang dievidensi).
--
-- 3. Permission BARU di-mint: m04.partnership_learning_result.manage
--    (Superadmin=ALL, Developer Partner=OWN — meniru pola D13-05/0014, satu
--    action mencakup CRUD penuh sama seperti notification_template_content.configure).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.partnership_learning_result.manage', 'own', 'Partnership Learning Result - Manage (Gate PRE-00-F §51, permission baru — tidak ada di master matrix; scope Developer Partner=OWN, semua role lain NONE kecuali Superadmin)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin',        'm04.partnership_learning_result.manage', 'all'),
  ('developer_partner',  'm04.partnership_learning_result.manage', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.partnership_learning_results (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  session_id           UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
  result_type          VARCHAR(100) NOT NULL,
  result_summary       TEXT,
  result_payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance_source    VARCHAR(150) NOT NULL,
  provenance_reference TEXT NOT NULL,
  validation_status    TEXT NOT NULL DEFAULT 'pending'
                          CHECK (validation_status IN ('pending','validated','rejected')),
  validated_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  validated_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.partnership_learning_results IS
  'ADD-NEW — tidak ada di STEP10-D, lihat rasional lengkap di atas migration ini. `provenance_source`/`provenance_reference` menutup field wajib "partner provenance" dari wireframe ADM-LRN-013. `validation_status` merepresentasikan makna "Validate" di deskripsi layar ADM-LRN-013 — hanya Superadmin yang bisa mengubahnya (lihat RLS, terpisah dari permission .manage milik Developer Partner) karena Gate §51 tidak memberi Admin/Manager akses sama sekali.';

-- ── Trigger: hanya Superadmin yang boleh mengubah validation_status ──
-- (Developer Partner OWN scope mencakup manage baris miliknya, tapi Gate §51
-- tidak menyebut Developer Partner berwenang men-"Validate" hasilnya sendiri —
-- validasi secara semantik adalah tindakan pihak ketiga/pengawas, konsisten
-- dengan makna kata "Validate" di deskripsi layar admin ADM-LRN-013).
CREATE OR REPLACE FUNCTION public.enforce_partnership_result_validation_superadmin_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validation_status IS DISTINCT FROM OLD.validation_status THEN
    IF NOT public.is_superadmin() THEN
      RAISE EXCEPTION 'partnership_learning_results: hanya Superadmin yang boleh mengubah validation_status (Gate PRE-00-F §51)';
    END IF;
    NEW.validated_by := auth.uid();
    NEW.validated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_partnership_result_validation_superadmin_only
  BEFORE UPDATE OF validation_status ON public.partnership_learning_results
  FOR EACH ROW EXECUTE FUNCTION public.enforce_partnership_result_validation_superadmin_only();

-- ── RLS ──

ALTER TABLE public.partnership_learning_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY partnership_learning_results_select ON public.partnership_learning_results
  FOR SELECT USING (public.has_permission('m04.partnership_learning_result.manage', partner_user_id));

CREATE POLICY partnership_learning_results_insert ON public.partnership_learning_results
  FOR INSERT WITH CHECK (
    public.has_permission('m04.partnership_learning_result.manage', partner_user_id)
    AND validation_status = 'pending'  -- tidak bisa langsung insert sebagai 'validated'
  );

CREATE POLICY partnership_learning_results_update ON public.partnership_learning_results
  FOR UPDATE USING (public.has_permission('m04.partnership_learning_result.manage', partner_user_id));
-- Catatan: WITH CHECK tidak perlu menduplikasi guard validation_status — sudah
-- ditegakkan otoritatif oleh trigger di atas (pola sama seperti 0016/0018).
