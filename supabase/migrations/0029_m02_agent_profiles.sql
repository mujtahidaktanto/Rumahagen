-- 0029_m02_agent_profiles.sql
-- Sumber kolom: STEP10-D entity AGENT_PROFILES (module M02) — 3 kolom gap
-- (profile_visibility, public_cta_enabled, ktp_requirement_state) diisi di
-- sini, lihat rasional per kolom di bawah.
--
-- Sumber aturan bisnis: docs/core/current/00-governance/STEP-00/
-- PRE-00-D_M02_PROFILE_PUBLIC_VISIBILITY_GATE_FULL_v1.1.md ("Gate PRE-00-D").
--
-- CATATAN PERMISSION PENTING: hanya 3 permission M02 yang ter-seed di 0009
-- (m02.profile_photo.upload/edit/delete) — TIDAK ADA permission untuk
-- Agent Profile View/Update maupun Reviews, meski Gate §6/§7/§11/§12/§13
-- mengunci role matrix-nya secara eksplisit dan rinci. Dicek ulang ke master
-- matrix 50-baris: memang tidak ada baris "Agent Profile" atau "Review" di
-- sana. Mengikuti pola D13-15 (mint permission baru HANYA dengan scope yang
-- diambil PERSIS dari gate, didokumentasikan eksplisit — bukan dikarang bebas),
-- 2 permission BARU di-mint di sini untuk Agent Profile (Review permission
-- menyusul di 0030 bersama tabel agent_reviews):
--   m02.agent_profile.view   → Gate §6:  Superadmin=BYPASS, Manager/Admin=ALL, Instructor/Agent/DevPartner/Buyer=OWN
--   m02.agent_profile.update → Gate §7:  Superadmin=BYPASS, semua role lain=OWN (Manager/Admin TIDAK dapat ALL untuk update — locked eksplisit "Manager/Admin are not granted inferred authority to update another Agent's profile")

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m02', 'm02.agent_profile.view', 'own', 'Agent Profile - View (Gate PRE-00-D §6, permission baru — tidak ada di master matrix)'),
  ('m02', 'm02.agent_profile.update', 'own', 'Agent Profile - Update (Gate PRE-00-D §7, permission baru — Manager/Admin TIDAK dapat ALL, hanya OWN, beda dari pola M-module lain)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin',        'm02.agent_profile.view', 'all'),
  ('manager',            'm02.agent_profile.view', 'all'),
  ('admin',              'm02.agent_profile.view', 'all'),
  ('instructor',         'm02.agent_profile.view', 'own'),
  ('agent',              'm02.agent_profile.view', 'own'),
  ('developer_partner',  'm02.agent_profile.view', 'own'),
  ('buyer',              'm02.agent_profile.view', 'own'),
  ('superadmin',        'm02.agent_profile.update', 'all'),
  ('manager',            'm02.agent_profile.update', 'own'),
  ('admin',              'm02.agent_profile.update', 'own'),
  ('instructor',         'm02.agent_profile.update', 'own'),
  ('agent',              'm02.agent_profile.update', 'own'),
  ('developer_partner',  'm02.agent_profile.update', 'own'),
  ('buyer',              'm02.agent_profile.update', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name              VARCHAR(150) NOT NULL,
  avatar_url             VARCHAR(500),
  bio                    TEXT,
  specialization         TEXT[],
  coverage_area          VARCHAR(255),
  office_name            VARCHAR(150),
  license_number         VARCHAR(50),
  whatsapp_number        VARCHAR(20) NOT NULL,
  contact_visibility     TEXT NOT NULL DEFAULT 'public' CHECK (contact_visibility IN ('public','hidden')),
  public_cta_enabled     BOOLEAN NOT NULL DEFAULT false,
  profile_visibility     TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public','private')),
  ktp_requirement_state  TEXT NOT NULL DEFAULT 'deferred' CHECK (ktp_requirement_state IN ('deferred','submitted','verified')),
  public_slug            VARCHAR(150) UNIQUE NOT NULL,
  total_listings_sold    INT NOT NULL DEFAULT 0,
  total_listings_rented  INT NOT NULL DEFAULT 0,
  deleted_at             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.agent_profiles.profile_visibility IS
  'ADD-NEW/downstream (STEP10-D logical_data_type ada, sql_physical_definition kosong). Default ''public'' persis Gate §8 ("Default Profile Visibility = PUBLIC"). Agent boleh toggle public↔private sendiri (lihat RLS) — ini state presentasi, BUKAN scope RBAC (Gate §5: "PUBLIC is a visibility state, not an RBAC scope value").';

COMMENT ON COLUMN public.agent_profiles.public_cta_enabled IS
  'ADD-NEW/downstream. Default false persis Gate §9: "A contact number not selected for public CTA is not automatically public" — WhatsApp CTA publik butuh opt-in eksplisit, bukan default terbuka.';

COMMENT ON COLUMN public.agent_profiles.ktp_requirement_state IS
  'ADD-NEW/downstream. Field PRESENTASI saja (M02 bukan otoritas KTP — Gate §16: M01 tetap otoritas identitas/verifikasi). 3 nilai merefleksikan Gate §16 "OTP VERIFIED → ACCOUNT ACTIVE, KTP optional at activation and may be deferred". Karena M01 di repo ini baru stub (0002, tanpa alur verifikasi KTP fisik), kolom ini murni cache presentasi, defaultnya ''deferred''.';

COMMENT ON COLUMN public.agent_profiles.total_listings_sold IS
  'Gate §11.4 mengunci ini sebagai HITUNGAN listing (status=sold), bukan nilai transaksi uang, dan M02 "must not independently mutate or redefine Listing status" — kolom ini proyeksi/cache, sinkronisasi dari listings (M03) adalah pekerjaan downstream terpisah (mis. trigger di tabel listings atau job berkala), TIDAK diimplementasikan di migration ini supaya M02 tidak diam-diam menjadi authoritative atas data M03.';

-- ── RLS ──

ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: profil public terlihat siapa pun (termasuk anonim, untuk marketplace
-- publik); profil private hanya terlihat lewat permission view (own/all).
-- Superadmin override eksplisit (Gate §10) sudah otomatis lewat is_superadmin()
-- di dalam has_permission(), tidak perlu logika terpisah.
CREATE POLICY agent_profiles_select ON public.agent_profiles
  FOR SELECT USING (
    (profile_visibility = 'public' AND deleted_at IS NULL)
    OR public.has_permission('m02.agent_profile.view', user_id)
  );

CREATE POLICY agent_profiles_insert ON public.agent_profiles
  FOR INSERT WITH CHECK (public.has_permission('m02.agent_profile.update', user_id));

CREATE POLICY agent_profiles_update ON public.agent_profiles
  FOR UPDATE USING (public.has_permission('m02.agent_profile.update', user_id));
