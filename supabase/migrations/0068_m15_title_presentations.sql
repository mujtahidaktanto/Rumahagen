-- 0068_m15_title_presentations.sql
-- Fase 3 (penutup batch tabel, lanjutan 0064-0067): TITLE_PRESENTATIONS —
-- tabel M15 terakhir dari 14 total (STEP11-B8 §13). Sumber kolom:
-- STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv, tanpa deviasi.
-- STEP11-B8 §11 M02 boundary: "Presentation/public profile may consume
-- awarded-title presentation. M02 does not issue, revoke, qualify, or
-- alter Award" — title_presentations murni PENGATURAN TAMPILAN (title mana
-- ditonjolkan di profil publik Agent), TERPISAH dari award_instances itu
-- sendiri (award tetap sah ada/tidaknya lepas dari ditampilkan atau tidak).
--
-- PERMISSION BARU: `m15.title_presentation.manage` — Agent=OWN (mengatur
-- tampilan title miliknya sendiri di profil, API-234/235 "PUT
-- /agents/me/awards/presentation"), Superadmin/Admin/Manager=ALL
-- (moderasi). TIDAK ADA validasi bahwa title_definition_id yang
-- ditampilkan benar-benar sudah di-award ke user tsb (award_instances) —
-- STEP11-B8 tidak mengevidence aturan itu secara eksplisit sebagai
-- constraint fisik; kalau perlu, itu validasi lapisan REST API nanti,
-- bukan trigger DB (pola sama seperti courses.prerequisite_course_id/0056
-- yang juga tidak divalidasi trigger).

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m15', 'm15.title_presentation.manage', 'own', 'Title Presentation - Manage (ADD-NEW, API-234/235 PUT /agents/me/awards/presentation — Agent=OWN atur tampilan title miliknya di profil, Superadmin/Admin/Manager=ALL moderasi)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm15.title_presentation.manage', 'all'),
  ('admin',      'm15.title_presentation.manage', 'all'),
  ('manager',    'm15.title_presentation.manage', 'all'),
  ('agent',      'm15.title_presentation.manage', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.title_presentations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_definition_id   UUID NOT NULL REFERENCES public.title_definitions(id) ON DELETE RESTRICT,
  presentation_type     TEXT NOT NULL,
  active                BOOLEAN NOT NULL DEFAULT true,
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, title_definition_id)
);

COMMENT ON TABLE public.title_presentations IS
  'Sumber: STEP10-D entity TITLE_PRESENTATIONS. UNIQUE(user_id, title_definition_id) mencegah baris presentation ganda untuk kombinasi user+title yang sama (tidak eksplisit di STEP10-D, konsisten dengan pola UNIQUE tabel M15 lain di repo ini).';

ALTER TABLE public.title_presentations ENABLE ROW LEVEL SECURITY;

-- SELECT: active=true publik (dikonsumsi profil publik M02 sesuai STEP11-B8
-- §11), pemilik lihat semua miliknya sendiri (termasuk yang non-aktif),
-- staf lihat semua.
CREATE POLICY title_presentations_select ON public.title_presentations
  FOR SELECT USING (
    active = true
    OR user_id = auth.uid()
    OR public.has_permission('m15.title_presentation.manage')
  );

CREATE POLICY title_presentations_manage ON public.title_presentations
  FOR ALL USING (public.has_permission('m15.title_presentation.manage', user_id))
  WITH CHECK (public.has_permission('m15.title_presentation.manage', user_id));
