-- 0149_m02_agent_ktp_auto_verification.sql
-- Verifikasi KTP Agent otomatis (keputusan produk 2026-09-25): admin tidak bisa bertemu Agent secara offline (apalagi lintas wilayah), sehingga verifikasi
-- tidak lewat tinjauan staf. Agent mengisi di profil: (1) foto/gambar KTP dan (2) nomor KTP (NIK, 16 digit). Setelah keduanya terkirim dan NIK lolos
-- pemeriksaan bentuk, status akun langsung `verified` dan lencana "Terverifikasi" tampil di profil publik. Kedua data bersifat PRIVAT.
--
-- Sebelumnya: `agent_profiles.ktp_requirement_state` (deferred|submitted|verified) hanya cache tampilan tanpa jalur pengisian, dan pemilik profil bisa
-- mengubahnya sendiri lewat UPDATE (policy agent_profiles_update); `agent_verification_documents` tidak punya unggahan file dan tidak punya jalur review.
--
-- Model:
--   * Data sensitif di tabel terpisah `agent_kyc` (user_id, ktp_number, ktp_photo_path): agar `select *` pada profil tidak pernah memuatnya. RLS: hanya
--     pemilik dan staf (m02.agent_profile.view) yang boleh membaca; TIDAK ada policy tulis (penulisan hanya lewat fungsi). Tidak tampil di view publik.
--   * `is_valid_nik(text)`: 16 digit, kode provinsi Indonesia valid, tanggal lahir (DD+40 untuk perempuan, MM) valid, nomor urut bukan 0000. NIK unik antar akun.
--   * `submit_my_ktp(nik, photo_path)`: hanya pemilik profil; foto harus berada di folder milik pemanggil di bucket privat `agent-ktp`; menyimpan data lalu
--     mengatur `ktp_requirement_state = 'verified'`. Kirim ulang menimpa data lama (tetap verified).
--   * Trigger: non-staf tidak bisa mengubah `ktp_requirement_state` (insert selalu deferred; update hanya lewat submit_my_ktp).
--   * `admin_reset_ktp(user, alasan)`: staf mencabut verifikasi (mis. dugaan KTP palsu): status kembali deferred, data KTP dihapus, tercatat di audit log.
--     Tanpa tinjauan sebelum verified, pencabutan ini adalah kendali penyalahgunaan.
--   * View `public_agent_profiles` menambah `is_verified` (lencana); nilai status mentah tetap tersembunyi.
-- Tabel agent_profiles/agent_kyc kosong saat ditulis (dicek live).

-- ═══ 1. Validasi NIK ═══
CREATE OR REPLACE FUNCTION public.is_valid_nik(p text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p IS NULL OR p !~ '^[0-9]{16}$' THEN false
    ELSE left(p, 2) = ANY (ARRAY['11','12','13','14','15','16','17','18','19','21','31','32','33','34','35','36','51','52','53',
                                 '61','62','63','64','65','71','72','73','74','75','76','81','82','91','92','93','94','95','96'])
      AND (substr(p, 7, 2)::int BETWEEN 1 AND 31 OR substr(p, 7, 2)::int BETWEEN 41 AND 71)
      AND substr(p, 9, 2)::int BETWEEN 1 AND 12
      AND substr(p, 13, 4) <> '0000'
  END;
$$;

-- ═══ 2. Tabel privat ═══
CREATE TABLE IF NOT EXISTS public.agent_kyc (
  user_id        uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  ktp_number     varchar(16) NOT NULL UNIQUE CHECK (public.is_valid_nik(ktp_number)),
  ktp_photo_path text NOT NULL,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.agent_kyc IS 'PRIVAT (0149): nomor KTP dan path foto KTP Agent. Hanya pemilik dan staf yang bisa membaca; ditulis lewat submit_my_ktp().';
ALTER TABLE public.agent_kyc ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_kyc_select ON public.agent_kyc FOR SELECT USING (public.has_permission('m02.agent_profile.view', user_id));
REVOKE ALL ON public.agent_kyc FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.agent_kyc TO authenticated;

-- ═══ 3. Status hanya lewat pengiriman KTP ═══
CREATE OR REPLACE FUNCTION public.enforce_ktp_state_via_submission()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR current_setting('app.ktp_submit', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF public.has_permission('m02.agent_profile.update') THEN
    RETURN NEW;  -- staf (scope all)
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.ktp_requirement_state IS DISTINCT FROM 'deferred' THEN
      RAISE EXCEPTION 'agent_profiles: status KTP hanya berubah lewat pengiriman KTP' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.ktp_requirement_state IS DISTINCT FROM OLD.ktp_requirement_state THEN
    RAISE EXCEPTION 'agent_profiles: status KTP hanya berubah lewat pengiriman KTP' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_ktp_state_via_submission ON public.agent_profiles;
CREATE TRIGGER trg_enforce_ktp_state_via_submission
  BEFORE INSERT OR UPDATE OF ktp_requirement_state ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_ktp_state_via_submission();

-- ═══ 4. Kirim KTP (foto + nomor) -> verified otomatis ═══
CREATE OR REPLACE FUNCTION public.submit_my_ktp(p_ktp_number text, p_photo_path text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'submit_my_ktp: harus login' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_permission('m02.agent_profile.update', v_uid) THEN
    RAISE EXCEPTION 'submit_my_ktp: tidak berhak' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.agent_profiles WHERE user_id = v_uid AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'agent_kyc: lengkapi profil Agent lebih dulu sebelum mengirim KTP' USING ERRCODE = '23514';
  END IF;
  IF NOT public.is_valid_nik(p_ktp_number) THEN
    RAISE EXCEPTION 'agent_kyc: nomor KTP tidak valid (16 digit, kode wilayah dan tanggal lahir harus sesuai)' USING ERRCODE = '23514';
  END IF;
  IF p_photo_path IS NULL OR left(p_photo_path, length(v_uid::text) + 1) <> v_uid::text || '/' OR length(p_photo_path) > 300 THEN
    RAISE EXCEPTION 'agent_kyc: foto KTP harus diunggah ke folder akun Anda' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.agent_kyc (user_id, ktp_number, ktp_photo_path)
  VALUES (v_uid, p_ktp_number, p_photo_path)
  ON CONFLICT (user_id) DO UPDATE
    SET ktp_number = EXCLUDED.ktp_number, ktp_photo_path = EXCLUDED.ktp_photo_path, updated_at = now();

  PERFORM set_config('app.ktp_submit', 'on', true);
  UPDATE public.agent_profiles SET ktp_requirement_state = 'verified', updated_at = now() WHERE user_id = v_uid;
  PERFORM set_config('app.ktp_submit', 'off', true);

  RETURN jsonb_build_object('status', 'verified', 'ktp_number_masked', repeat('*', 12) || right(p_ktp_number, 4));
END;
$$;
REVOKE ALL ON FUNCTION public.submit_my_ktp(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_my_ktp(text, text) TO authenticated;

-- ═══ 5. Staf mencabut verifikasi ═══
CREATE OR REPLACE FUNCTION public.admin_reset_ktp(p_user_id uuid, p_reason text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('m02.agent_profile.update') THEN
    RAISE EXCEPTION 'admin_reset_ktp: hanya staf yang boleh mencabut verifikasi KTP' USING ERRCODE = '42501';
  END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'agent_kyc: alasan pencabutan wajib diisi' USING ERRCODE = '23514';
  END IF;
  DELETE FROM public.agent_kyc WHERE user_id = p_user_id RETURNING ktp_photo_path INTO v_path;
  PERFORM set_config('app.ktp_submit', 'on', true);
  UPDATE public.agent_profiles SET ktp_requirement_state = 'deferred', updated_at = now() WHERE user_id = p_user_id;
  PERFORM set_config('app.ktp_submit', 'off', true);
  PERFORM public.log_audit_event('m02.agent.ktp_reset', 'agent_profiles', p_user_id, NULL, NULL, jsonb_build_object('reason', p_reason));
  RETURN v_path;  -- path foto untuk dihapus dari storage oleh server
END;
$$;
REVOKE ALL ON FUNCTION public.admin_reset_ktp(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_ktp(uuid, text) TO authenticated;

-- ═══ 6. Bucket privat foto KTP ═══
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('agent-ktp', 'agent-ktp', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ═══ 7. Lencana di profil publik ═══
-- Kolom baru di tengah daftar: view dibuat ulang (CREATE OR REPLACE tidak boleh menggeser kolom).
DROP VIEW IF EXISTS public.public_agent_profiles;
CREATE VIEW public.public_agent_profiles AS
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
  (ap.ktp_requirement_state = 'verified') AS is_verified,
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
COMMENT ON VIEW public.public_agent_profiles IS 'Satu-satunya jalur baca profil Agent untuk publik (0148/0149). Tanpa email/ktp/timestamp/organization_id.';
REVOKE ALL ON public.public_agent_profiles FROM PUBLIC;
GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;
