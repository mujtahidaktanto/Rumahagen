-- 0148_m02_public_agent_profile_privacy.sql
-- Privasi profil publik Agent dan aturan title tampilan 1 utama + 3 tambahan (keputusan produk 2026-09-25).
-- Sebelumnya aturan akses (RLS) hanya membatasi BARIS: profil berstatus public terbaca semua kolomnya oleh siapa pun (juga lewat REST langsung):
-- ktp_requirement_state, deleted_at, created_at, updated_at, organization_id, dan data lain; award_instances aktif terbaca publik seluruhnya.
--
-- Model setelah migration ini:
--   * Publik (anon dan pengguna login lain) membaca profil lewat view `public_agent_profiles`: user_id (boleh publik: hanya identitas internal RumahAgen),
--     public_slug, full_name, avatar_url, bio, specialization, coverage_area, office_name, license_number (branding agen), whatsapp_number (selalu publik:
--     buyer yang mencari agen di wilayahnya harus bisa menghubungi), public_cta_enabled, province_name, city_name, organization_name (NAMA, bukan ID),
--     active_listings_count, total_listings_sold, total_listings_rented, primary_title, additional_titles.
--     Disembunyikan: email, ktp_requirement_state, deleted_at, created_at, updated_at, organization_id, contact_visibility, profile_visibility.
--     Profil private, terhapus, dan akun non-aktif tidak muncul sama sekali.
--   * Tabel `agent_profiles` dan `award_instances` hanya terbaca pemilik dan staf (cabang publik dihapus, SELECT anon dicabut). `title_presentations` tetap
--     terbaca publik untuk baris aktif (isinya hanya pilihan tampilan Agent). `contact_visibility` tidak lagi berpengaruh (WhatsApp selalu publik).
--   * Title di profil publik: maksimal 1 utama (`primary`) + 3 tambahan (`additional`, urutan 1..3), dipaksa di DB (tipe hanya primary|additional, satu
--     primary aktif per pengguna, urutan tambahan unik). Aturan tampil:
--       - belum punya award: kosong;
--       - baru punya 1: otomatis menjadi utama;
--       - punya 2..4: SEMUA tampil, Agent memilih satu sebagai utama, sisanya tambahan (otomatis mengisi urutan berikutnya saat award baru diterima);
--       - punya lebih dari 4: Agent menentukan sendiri pilihan (utama wajib + 0..3 tambahan) dari award yang dimilikinya.
--     Saat award berakhir/dicabut, pilihan dirapikan otomatis (tambahan pertama naik menjadi utama; slot kosong diisi award lain yang belum tampil sampai 4).
--   * `set_my_public_titles(primary, additional[])` mengganti seluruh pilihan (title harus punya award active/restored milik pemanggil).
-- Tabel title_presentations, title_definitions, award_instances dan agent_profiles kosong saat ditulis (dicek live), jadi constraint langsung divalidasi.

-- ═══ 1. Title presentation: 1 utama + 3 tambahan ═══
ALTER TABLE public.title_presentations
  ADD CONSTRAINT title_presentations_type_check CHECK (presentation_type IN ('primary', 'additional')),
  ADD CONSTRAINT title_presentations_order_check CHECK (
    (presentation_type = 'primary' AND COALESCE(display_order, 0) = 0)
    OR (presentation_type = 'additional' AND display_order BETWEEN 1 AND 3)
  );
CREATE UNIQUE INDEX IF NOT EXISTS uq_title_presentation_primary
  ON public.title_presentations (user_id) WHERE active AND presentation_type = 'primary';
CREATE UNIQUE INDEX IF NOT EXISTS uq_title_presentation_additional_order
  ON public.title_presentations (user_id, display_order) WHERE active AND presentation_type = 'additional';

-- Tulis daftar berurutan (maks 4): elemen pertama = utama, sisanya tambahan 1..3. Internal (dipakai set_my_public_titles dan rapikan otomatis).
CREATE OR REPLACE FUNCTION public.write_public_titles(p_user uuid, p_list uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_i int := 0;
BEGIN
  UPDATE public.title_presentations SET active = false, updated_at = now() WHERE user_id = p_user AND active;
  FOREACH v_id IN ARRAY COALESCE(p_list, ARRAY[]::uuid[]) LOOP
    IF v_i = 0 THEN
      INSERT INTO public.title_presentations (user_id, title_definition_id, presentation_type, display_order, active)
      VALUES (p_user, v_id, 'primary', 0, true)
      ON CONFLICT (user_id, title_definition_id) DO UPDATE
        SET presentation_type = 'primary', display_order = 0, active = true, updated_at = now();
    ELSE
      INSERT INTO public.title_presentations (user_id, title_definition_id, presentation_type, display_order, active)
      VALUES (p_user, v_id, 'additional', v_i, true)
      ON CONFLICT (user_id, title_definition_id) DO UPDATE
        SET presentation_type = 'additional', display_order = v_i, active = true, updated_at = now();
    END IF;
    v_i := v_i + 1;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.write_public_titles(uuid, uuid[]) FROM PUBLIC, anon, authenticated;

-- Rapikan otomatis: pertahankan pilihan Agent yang award-nya masih berlaku, naikkan tambahan pertama bila utama hilang, lalu isi slot kosong (sampai 4)
-- dengan award lain yang belum tampil (urut tanggal terbit).
CREATE OR REPLACE FUNCTION public.rebalance_public_titles(p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kept uuid[];
  v_fill uuid[];
BEGIN
  SELECT COALESCE(array_agg(tp.title_definition_id ORDER BY (tp.presentation_type <> 'primary'), tp.display_order, tp.created_at), ARRAY[]::uuid[])
    INTO v_kept
  FROM public.title_presentations tp
  WHERE tp.user_id = p_user AND tp.active
    AND EXISTS (SELECT 1 FROM public.award_instances ai
                WHERE ai.user_id = p_user AND ai.title_definition_id = tp.title_definition_id AND ai.status IN ('active', 'restored'));

  IF cardinality(v_kept) < 4 THEN
    SELECT COALESCE(array_agg(t.title_definition_id ORDER BY t.first_issued), ARRAY[]::uuid[]) INTO v_fill
    FROM (
      SELECT ai.title_definition_id, min(ai.issued_at) AS first_issued
      FROM public.award_instances ai
      WHERE ai.user_id = p_user AND ai.status IN ('active', 'restored') AND NOT (ai.title_definition_id = ANY (v_kept))
      GROUP BY ai.title_definition_id
      ORDER BY min(ai.issued_at)
      LIMIT 4 - cardinality(v_kept)
    ) t;
    v_kept := v_kept || v_fill;
  END IF;

  PERFORM public.write_public_titles(p_user, v_kept[1:4]);
END;
$$;
REVOKE ALL ON FUNCTION public.rebalance_public_titles(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_rebalance_public_titles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.rebalance_public_titles(NEW.user_id);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.trg_rebalance_public_titles() FROM PUBLIC, anon, authenticated;
-- Nama berawalan "trg_r" agar berjalan SETELAH trg_deactivate_presentation_on_award_end (urutan alfabet).
DROP TRIGGER IF EXISTS trg_rebalance_public_titles ON public.award_instances;
CREATE TRIGGER trg_rebalance_public_titles
  AFTER INSERT OR UPDATE OF status ON public.award_instances
  FOR EACH ROW EXECUTE FUNCTION public.trg_rebalance_public_titles();

CREATE OR REPLACE FUNCTION public.set_my_public_titles(p_primary uuid, p_additional uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS SETOF public.title_presentations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_add uuid[] := COALESCE(p_additional, ARRAY[]::uuid[]);
  v_id uuid;
  v_held uuid[];
  v_all uuid[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'set_my_public_titles: harus login' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_permission('m15.title_presentation.manage', v_uid) THEN
    RAISE EXCEPTION 'set_my_public_titles: tidak berhak mengatur title tampilan' USING ERRCODE = '42501';
  END IF;
  IF cardinality(v_add) > 3 THEN
    RAISE EXCEPTION 'title_presentations: maksimal 3 title tambahan' USING ERRCODE = '23514';
  END IF;
  IF array_position(v_add, NULL) IS NOT NULL OR (SELECT count(DISTINCT x) FROM unnest(v_add) x) <> cardinality(v_add) THEN
    RAISE EXCEPTION 'title_presentations: title tambahan tidak boleh kosong atau ganda' USING ERRCODE = '23514';
  END IF;
  IF p_primary IS NOT NULL AND p_primary = ANY (v_add) THEN
    RAISE EXCEPTION 'title_presentations: title utama tidak boleh juga menjadi title tambahan' USING ERRCODE = '23514';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT ai.title_definition_id), ARRAY[]::uuid[]) INTO v_held
  FROM public.award_instances ai WHERE ai.user_id = v_uid AND ai.status IN ('active', 'restored');

  IF cardinality(v_held) = 0 THEN
    IF p_primary IS NOT NULL OR cardinality(v_add) > 0 THEN
      RAISE EXCEPTION 'title_presentations: title hanya bisa ditampilkan bila award-nya berstatus active atau restored' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF p_primary IS NULL THEN
      RAISE EXCEPTION 'title_presentations: title utama wajib dipilih bila Anda memiliki award' USING ERRCODE = '23514';
    END IF;
    v_all := p_primary || v_add;
    FOREACH v_id IN ARRAY v_all LOOP
      IF NOT (v_id = ANY (v_held)) THEN
        RAISE EXCEPTION 'title_presentations: title hanya bisa ditampilkan bila award-nya berstatus active atau restored' USING ERRCODE = '23514';
      END IF;
    END LOOP;
    -- Punya 4 award atau kurang: semua award tampil (utama + sisanya tambahan). Lebih dari 4: Agent menentukan sendiri (maks 1 + 3).
    IF cardinality(v_held) <= 4 AND cardinality(v_all) <> cardinality(v_held) THEN
      RAISE EXCEPTION 'title_presentations: dengan % award, semuanya ditampilkan (pilih satu sebagai utama, sisanya tambahan)', cardinality(v_held) USING ERRCODE = '23514';
    END IF;
  END IF;

  PERFORM public.write_public_titles(v_uid, CASE WHEN p_primary IS NULL THEN ARRAY[]::uuid[] ELSE p_primary || v_add END);
  RETURN QUERY SELECT * FROM public.title_presentations WHERE user_id = v_uid AND active ORDER BY presentation_type, display_order;
END;
$$;
REVOKE ALL ON FUNCTION public.set_my_public_titles(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_public_titles(uuid, uuid[]) TO authenticated;

-- ═══ 2. View profil publik ═══
CREATE OR REPLACE VIEW public.public_agent_profiles AS
SELECT
  ap.user_id,
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
  prv.name AS province_name,
  cty.name AS city_name,
  org.organization_name AS organization_name,
  (SELECT count(*) FROM public.listings l WHERE l.agent_id = ap.user_id AND l.status = 'published') AS active_listings_count,
  ap.total_listings_sold,
  ap.total_listings_rented,
  (SELECT jsonb_build_object('code', td.code, 'name', td.name, 'description', td.description,
            'issued_at', (SELECT min(ai.issued_at) FROM public.award_instances ai
                          WHERE ai.user_id = tp.user_id AND ai.title_definition_id = tp.title_definition_id AND ai.status IN ('active', 'restored')))
     FROM public.title_presentations tp JOIN public.title_definitions td ON td.id = tp.title_definition_id
     WHERE tp.user_id = ap.user_id AND tp.active AND tp.presentation_type = 'primary' LIMIT 1) AS primary_title,
  COALESCE((SELECT jsonb_agg(jsonb_build_object('code', td.code, 'name', td.name, 'description', td.description,
            'issued_at', (SELECT min(ai.issued_at) FROM public.award_instances ai
                          WHERE ai.user_id = tp.user_id AND ai.title_definition_id = tp.title_definition_id AND ai.status IN ('active', 'restored')))
            ORDER BY tp.display_order)
     FROM public.title_presentations tp JOIN public.title_definitions td ON td.id = tp.title_definition_id
     WHERE tp.user_id = ap.user_id AND tp.active AND tp.presentation_type = 'additional'), '[]'::jsonb) AS additional_titles
FROM public.agent_profiles ap
JOIN public.users u ON u.id = ap.user_id AND u.status = 'active' AND u.deleted_at IS NULL
LEFT JOIN public.ref_provinces prv ON prv.id = ap.province_id
LEFT JOIN public.ref_cities cty ON cty.id = ap.city_id
LEFT JOIN public.organizations org ON org.id = ap.organization_id AND org.status = 'active' AND org.deleted_at IS NULL
WHERE ap.profile_visibility = 'public' AND ap.deleted_at IS NULL;
COMMENT ON VIEW public.public_agent_profiles IS 'Satu-satunya jalur baca profil Agent untuk publik (0148). Tanpa email/ktp_requirement_state/timestamp/organization_id.';
REVOKE ALL ON public.public_agent_profiles FROM PUBLIC;
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;

-- ═══ 3. Tabel dasar: hanya pemilik dan staf ═══
DROP POLICY IF EXISTS agent_profiles_select ON public.agent_profiles;
CREATE POLICY agent_profiles_select ON public.agent_profiles
  FOR SELECT USING (public.has_permission('m02.agent_profile.view', user_id));
REVOKE SELECT ON public.agent_profiles FROM anon;
COMMENT ON COLUMN public.agent_profiles.contact_visibility IS 'Usang (0148): WhatsApp selalu publik pada profil publik; kolom dipertahankan tanpa efek.';

-- Publik hanya melihat award yang dipilih tampil (lewat view), bukan seluruh award.
DROP POLICY IF EXISTS award_instances_select ON public.award_instances;
CREATE POLICY award_instances_select ON public.award_instances
  FOR SELECT USING (public.has_permission('m15.award.manage', user_id));
REVOKE SELECT ON public.award_instances FROM anon;
