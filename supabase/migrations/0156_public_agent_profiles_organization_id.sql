-- 0156_public_agent_profiles_organization_id.sql
-- Halaman publik Organisasi mengambil anggota tim dari view `public_agent_profiles`. Sebelumnya view hanya memuat `organization_name`, dan nama organisasi TIDAK unik
-- (hanya organizations.slug yang unik), sehingga dua organisasi bernama sama berbagi daftar anggota. Keputusan pemilik produk 2026-09-26: cocokkan dengan ID organisasi.
-- Kolom baru `organization_id` ditambahkan di AKHIR view (kolom lama, urutan, dan hak akses tidak berubah). Nilainya diambil dari join organisasi yang sudah ada
-- (`org.id`, hanya organisasi berstatus active dan tidak dihapus), sehingga NULL untuk agen tanpa organisasi atau dengan organisasi yang tidak aktif — sama seperti organization_name.
-- ID organisasi bukan data sensitif: organizations.id sudah terbaca publik lewat policy organizations_select_active_public dan listings.organization_id.
-- Ditambah indeks agent_profiles(organization_id) untuk pencarian anggota per organisasi.

CREATE OR REPLACE VIEW public.public_agent_profiles AS
 SELECT ap.user_id,
    ap.public_slug,
    ap.full_name,
    ap.avatar_url,
    ap.bio,
    ap.specialization,
    ap.coverage_area,
    ap.office_name,
    ap.license_number,
    ap.whatsapp_number,
    ap.public_cta_enabled,
    ap.ktp_requirement_state = 'verified'::text AS is_verified,
    prv.name AS province_name,
    cty.name AS city_name,
    org.organization_name,
    ( SELECT count(*) AS count
           FROM listings l
          WHERE l.agent_id = ap.user_id AND l.status = 'published'::text) AS active_listings_count,
    ap.total_listings_sold,
    ap.total_listings_rented,
    ( SELECT jsonb_build_object('code', td.code, 'name', td.name, 'description', td.description, 'issued_at', ( SELECT min(ai.issued_at) AS min
                   FROM award_instances ai
                  WHERE ai.user_id = tp.user_id AND ai.title_definition_id = tp.title_definition_id AND (ai.status = ANY (ARRAY['active'::text, 'restored'::text])))) AS jsonb_build_object
           FROM title_presentations tp
             JOIN title_definitions td ON td.id = tp.title_definition_id
          WHERE tp.user_id = ap.user_id AND tp.active AND tp.presentation_type = 'primary'::text
         LIMIT 1) AS primary_title,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('code', td.code, 'name', td.name, 'description', td.description, 'issued_at', ( SELECT min(ai.issued_at) AS min
                   FROM award_instances ai
                  WHERE ai.user_id = tp.user_id AND ai.title_definition_id = tp.title_definition_id AND (ai.status = ANY (ARRAY['active'::text, 'restored'::text])))) ORDER BY tp.display_order) AS jsonb_agg
           FROM title_presentations tp
             JOIN title_definitions td ON td.id = tp.title_definition_id
          WHERE tp.user_id = ap.user_id AND tp.active AND tp.presentation_type = 'additional'::text), '[]'::jsonb) AS additional_titles,
    org.id AS organization_id
   FROM agent_profiles ap
     JOIN users u ON u.id = ap.user_id AND u.status = 'active'::text AND u.deleted_at IS NULL
     LEFT JOIN ref_provinces prv ON prv.id = ap.province_id
     LEFT JOIN ref_cities cty ON cty.id = ap.city_id
     LEFT JOIN organizations org ON org.id = ap.organization_id AND org.status = 'active'::text AND org.deleted_at IS NULL
  WHERE ap.profile_visibility = 'public'::text AND ap.deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_agent_profiles_organization_id ON public.agent_profiles (organization_id) WHERE organization_id IS NOT NULL;
