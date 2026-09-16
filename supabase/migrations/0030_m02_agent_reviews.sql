-- 0030_m02_agent_reviews.sql
-- Sumber kolom: STEP10-D entity AGENT_REVIEWS (module M02).
--
-- DEVIASI TERDOKUMENTASI PENTING dari STEP10-D literal: kolom `status` di
-- STEP10-D punya DEFAULT 'pending' — TAPI Gate PRE-00-D §13-14 secara eksplisit
-- MERECONCILE ini jadi AUTO-APPROVED untuk Buyer submit maupun Agent
-- self-review, dengan moderasi Admin terjadi PASCA-publikasi (bukan gate
-- persetujuan). Gate menyebut konflik ini secara eksplisit sebagai
-- `M02-CI-008` dengan resolusi `RECONCILE` — keputusan gate MENANG atas
-- default literal skema (pola sama seperti D13-04/PUT admin/config/dbr di
-- migration 0008: gate/keputusan rekonsiliasi adalah otoritas final, bukan
-- kolom DEFAULT yang belum direkonsiliasi). Default diubah ke ''approved''.
--
-- CATATAN PERMISSION: mengikuti pola 0029, permission Review TIDAK ada di
-- master matrix 50-baris — 2 permission BARU di-mint, scope PERSIS dari Gate
-- §11 (Create) dan §12 (View); moderasi post-publikasi (Gate §13, Admin=ALL
-- saja, bukan Manager) pakai permission ketiga.

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m02', 'm02.review.create', 'own', 'Agent Review - Create (Gate PRE-00-D §11, permission baru; Agent=OWN self-review, Buyer=OWN)'),
  ('m02', 'm02.review.view', 'own', 'Agent Review - View (Gate PRE-00-D §12, permission baru)'),
  ('m02', 'm02.review.moderate', 'own', 'Agent Review - Moderate (Gate PRE-00-D §13, permission baru; post-publication moderation, Admin-only, BUKAN approval gate)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm02.review.create', 'all'),
  ('agent',      'm02.review.create', 'own'),
  ('buyer',      'm02.review.create', 'own'),
  ('superadmin', 'm02.review.view', 'all'),
  ('manager',    'm02.review.view', 'all'),
  ('admin',      'm02.review.view', 'all'),
  ('agent',      'm02.review.view', 'all'),
  ('buyer',      'm02.review.view', 'all'),
  ('superadmin', 'm02.review.moderate', 'all'),
  ('admin',      'm02.review.moderate', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.agent_reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  listing_lead_id   UUID,  -- referensi longgar, tidak ada FK — entitas "lead" M03 belum dibangun (di luar scope migration manapun sejauh ini)
  reviewer_name     VARCHAR(150),
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT,
  status            TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  moderated_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  moderated_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.agent_reviews.status IS
  'DEFAULT ''approved'' (BUKAN ''pending'' seperti tertulis literal di STEP10-D) — lihat catatan deviasi di atas migration ini, mengikuti resolusi Gate PRE-00-D §13-14 (auto-approve, moderasi Admin terjadi setelah publikasi, bukan sebagai gate).';

-- ── RLS ──

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_reviews_select ON public.agent_reviews
  FOR SELECT USING (
    (status = 'approved' AND deleted_at IS NULL)  -- publik lihat review yang sudah tayang
    OR public.has_permission('m02.review.view', agent_id)
    OR public.has_permission('m02.review.view', buyer_id)
  );

-- INSERT: auto-approved langsung dari WITH CHECK (bukan trigger terpisah) —
-- selaras dengan Gate: submit = langsung published, bukan proses dua tahap.
CREATE POLICY agent_reviews_insert ON public.agent_reviews
  FOR INSERT WITH CHECK (
    public.has_permission('m02.review.create', COALESCE(buyer_id, agent_id))
    AND status = 'approved'
  );

-- UPDATE: HANYA moderasi pasca-publikasi (Admin/Superadmin) — pemberi review
-- TIDAK bisa mengedit review yang sudah dikirim (Gate tidak menyebut hak edit
-- untuk reviewer, hanya create/view + moderasi Admin).
CREATE POLICY agent_reviews_moderate ON public.agent_reviews
  FOR UPDATE USING (public.has_permission('m02.review.moderate'))
  WITH CHECK (public.has_permission('m02.review.moderate'));
