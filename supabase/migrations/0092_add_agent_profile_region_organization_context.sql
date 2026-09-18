-- 0092_add_agent_profile_region_organization_context.sql
-- Menutup temuan Tier 3 T3-1/T3-2 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-D_M02_PROFILE_PUBLIC_
-- VISIBILITY_GATE_FULL_v1.1.md` §11.2 (`M02-CI-021`, AUGMENT/LOCK) mengunci
-- alamat Agent Profile memakai model region Indonesia (Provinsi = field
-- provinsi administratif, Kota = field kota administratif, Area = field
-- bebas untuk detail lokal) -- "must not collapse the Indonesian regional
-- hierarchy into one unrestricted administrative field". §11.3 (`M02-CI-
-- 022`, PRESERVE/CLARIFY) mengunci "Organization Name" merepresentasikan
-- konteks organisasi Agent (yang diikuti ATAU yang dibuat/dioperasikan),
-- TAPI eksplisit "M02 presents, M12 remains the authoritative Organization/
-- Membership truth" -- karena itu direpresentasikan sebagai REFERENSI
-- (organization_id), bukan salinan teks nama organisasi yang bisa basi.
--
-- `0029_m02_agent_profiles.sql` hanya punya `coverage_area` (TEXT bebas,
-- sudah cukup untuk "Area" -- TIDAK perlu kolom baru untuk itu) dan
-- `office_name` -- tidak ada province_id/city_id atau organization_id sama
-- sekali. Gate PRE-00-D v1.1 ini direvisi SETELAH STEP10-D terakhir
-- disinkronkan (root cause sama seperti pola drift 0002/0083, tapi di sini
-- Core sendiri sudah menandainya sebagai residual yang belum diprioritaskan,
-- bukan penyimpangan diam-diam).
--
-- Nullable -- Provinsi/Kota/Organization adalah kelengkapan profil opsional,
-- bukan syarat wajib registrasi (konsisten dengan keputusan 0083: tidak ada
-- gate aktivasi tambahan). Tidak ada backfill -- tabel dikonfirmasi kosong
-- (belum ada agent profile produksi) saat migration ini diterapkan.

ALTER TABLE public.agent_profiles ADD COLUMN province_id UUID REFERENCES public.ref_provinces(id) ON DELETE SET NULL;
ALTER TABLE public.agent_profiles ADD COLUMN city_id UUID REFERENCES public.ref_cities(id) ON DELETE SET NULL;
ALTER TABLE public.agent_profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.agent_profiles.province_id IS
  'ADD-NEW/0092 — Gate PRE-00-D §11.2 (M02-CI-021): field "Provinsi" administratif, dipisah dari `coverage_area` (yang tetap berperan sebagai "Area" bebas teks). M02 hanya MENAMPILKAN, bukan otoritas geografis (referensi ref_provinces yang sudah ada).';
COMMENT ON COLUMN public.agent_profiles.city_id IS
  'ADD-NEW/0092 — Gate PRE-00-D §11.2 (M02-CI-021): field "Kota" administratif, pasangan province_id.';
COMMENT ON COLUMN public.agent_profiles.organization_id IS
  'ADD-NEW/0092 — Gate PRE-00-D §11.3 (M02-CI-022): "Organization Name" pada Agent Profile direpresentasikan sebagai REFERENSI ke public.organizations (bukan salinan teks nama), supaya tidak duplikasi/basi -- M12 tetap otoritas Organization/Membership truth, M02 hanya menampilkan konteksnya. NULL kalau Agent belum bergabung/membuat organisasi mana pun.';

-- RLS UPDATE (agent_profiles_update, 0029) sudah menggerbangi seluruh tabel
-- lewat m02.agent_profile.update (own scope) -- kolom baru otomatis
-- tercakup, tidak perlu policy baru.
