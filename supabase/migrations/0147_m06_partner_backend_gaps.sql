-- 0147_m06_partner_backend_gaps.sql
-- Menutup gap backend persona Developer Partner (Fase F, SOURCE-Developer-Partner.md §6 dan §8 butir 5):
--   1. Tidak ada agregat "semua klaim masuk lintas proyek" dan baris klaim tidak memuat nama Agent (perlu join profil).
--   2. Dashboard hanya berisi jumlah notifikasi; angka proyek/klaim/kit/event harus dihitung klien dari banyak panggilan.
--   3. Tidak ada mekanisme unggah file: marketing_kit.file_url dan developer_project_media.url hanya teks bebas, tak ada bucket storage.
-- (Filter "milik saya" pada daftar proyek/perusahaan dikerjakan di lapisan API, tanpa migration.)
--
-- Model:
--   * `partner_incoming_claims(status?, project?, partner?, limit, offset)`: klaim atas proyek milik perusahaan pemanggil (Developer Partner pemilik akun);
--     staf (m06.developer_partner.manage) boleh menyebut `p_partner_id`. Memuat identitas dan kontak Agent (keputusan produk 2026-09-25: mitra harus
--     bisa menghubungi Agent yang mengklaim): nama lengkap, nomor WhatsApp, dan email akun, TERLEPAS dari pengaturan visibilitas profil/kontak (mengajukan klaim =
--     kesediaan dihubungi developer pemilik proyek); slug profil publik hanya bila profil berstatus public. Dokumen dan data pribadi lain tidak disertakan.
--     `total_count` untuk paginasi.
--   * `partner_dashboard_summary(partner?)`: satu jsonb berisi jumlah proyek per status, klaim per status, marketing kit, media, dan event yang diajukan.
--   * Bucket storage: `project-media` (publik; foto/video proyek tampil di halaman publik) dan `marketing-kits` (privat; hanya PDF, diunduh lewat signed URL
--     yang dibuat server). Batas ukuran dan tipe file ditegakkan storage. Tanpa policy storage.objects: unggah hanya lewat signed upload URL yang dibuat
--     server setelah memeriksa kepemilikan proyek.

-- ═══ 1. Bucket storage ═══
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-media', 'project-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('marketing-kits', 'marketing-kits', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ═══ 2. Klaim masuk lintas proyek ═══
CREATE OR REPLACE FUNCTION public.partner_incoming_claims(
  p_status text DEFAULT NULL,
  p_project_id uuid DEFAULT NULL,
  p_partner_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
) RETURNS TABLE (
  claim_id uuid, project_id uuid, project_name text, project_status text,
  agent_id uuid, agent_name text, agent_public_slug text, agent_whatsapp text, agent_email text,
  status text, claimed_at timestamptz, reviewed_at timestamptz, total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids uuid[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'partner_incoming_claims: harus login' USING ERRCODE = '42501';
  END IF;
  IF p_partner_id IS NULL THEN
    SELECT COALESCE(array_agg(dp.id), ARRAY[]::uuid[]) INTO v_ids
    FROM public.developer_partners dp WHERE dp.user_id = auth.uid() AND dp.deleted_at IS NULL;
  ELSIF public.has_permission('m06.developer_partner.manage') THEN
    v_ids := ARRAY[p_partner_id];
  ELSE
    RAISE EXCEPTION 'partner_incoming_claims: hanya staf yang boleh menyebut perusahaan lain' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT c.id, c.project_id, dpr.name::text, dpr.status::text,
         c.agent_id, ap.full_name::text,
         CASE WHEN ap.profile_visibility = 'public' THEN ap.public_slug::text END,
         ap.whatsapp_number::text, au.email::text,
         c.status::text, c.claimed_at, c.reviewed_at,
         count(*) OVER () AS total_count
  FROM public.agent_project_claims c
  JOIN public.developer_projects dpr ON dpr.id = c.project_id
  LEFT JOIN public.agent_profiles ap ON ap.user_id = c.agent_id AND ap.deleted_at IS NULL
  LEFT JOIN auth.users au ON au.id = c.agent_id
  WHERE dpr.developer_id = ANY (v_ids)
    AND (p_status IS NULL OR c.status = p_status)
    AND (p_project_id IS NULL OR c.project_id = p_project_id)
  ORDER BY c.claimed_at DESC, c.id
  LIMIT greatest(1, least(coalesce(p_limit, 50), 200)) OFFSET greatest(coalesce(p_offset, 0), 0);
END;
$$;
REVOKE ALL ON FUNCTION public.partner_incoming_claims(text, uuid, uuid, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.partner_incoming_claims(text, uuid, uuid, integer, integer) TO authenticated;

-- ═══ 3. Ringkasan dashboard mitra ═══
CREATE OR REPLACE FUNCTION public.partner_dashboard_summary(p_partner_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids uuid[];
  v_users uuid[];
  v_projects jsonb;
  v_claims jsonb;
  v_events jsonb;
  v_kits bigint;
  v_media bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'partner_dashboard_summary: harus login' USING ERRCODE = '42501';
  END IF;
  IF p_partner_id IS NULL THEN
    SELECT COALESCE(array_agg(dp.id), ARRAY[]::uuid[]), COALESCE(array_agg(dp.user_id), ARRAY[]::uuid[]) INTO v_ids, v_users
    FROM public.developer_partners dp WHERE dp.user_id = auth.uid() AND dp.deleted_at IS NULL;
  ELSIF public.has_permission('m06.developer_partner.manage') THEN
    SELECT ARRAY[dp.id], ARRAY[dp.user_id] INTO v_ids, v_users FROM public.developer_partners dp WHERE dp.id = p_partner_id;
    v_ids := COALESCE(v_ids, ARRAY[]::uuid[]);
    v_users := COALESCE(v_users, ARRAY[]::uuid[]);
  ELSE
    RAISE EXCEPTION 'partner_dashboard_summary: hanya staf yang boleh menyebut perusahaan lain' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object('total', COALESCE(sum(n), 0), 'by_status', COALESCE(jsonb_object_agg(status, n), '{}'::jsonb))
    INTO v_projects
  FROM (SELECT status, count(*) AS n FROM public.developer_projects WHERE developer_id = ANY (v_ids) GROUP BY status) s;

  SELECT jsonb_build_object('total', COALESCE(sum(n), 0), 'by_status', COALESCE(jsonb_object_agg(status, n), '{}'::jsonb),
                            'pending', COALESCE(sum(n) FILTER (WHERE status = 'pending'), 0))
    INTO v_claims
  FROM (SELECT c.status, count(*) AS n
        FROM public.agent_project_claims c JOIN public.developer_projects dpr ON dpr.id = c.project_id
        WHERE dpr.developer_id = ANY (v_ids) GROUP BY c.status) s;

  SELECT count(*) INTO v_kits FROM public.marketing_kit k JOIN public.developer_projects dpr ON dpr.id = k.project_id WHERE dpr.developer_id = ANY (v_ids);
  SELECT count(*) INTO v_media FROM public.developer_project_media m JOIN public.developer_projects dpr ON dpr.id = m.project_id WHERE dpr.developer_id = ANY (v_ids);

  SELECT jsonb_build_object('total', COALESCE(sum(n), 0), 'by_status', COALESCE(jsonb_object_agg(status, n), '{}'::jsonb))
    INTO v_events
  FROM (SELECT status, count(*) AS n FROM public.events WHERE submitted_by = ANY (v_users) AND deleted_at IS NULL GROUP BY status) s;

  RETURN jsonb_build_object('projects', v_projects, 'claims', v_claims, 'marketing_kits', v_kits, 'media', v_media, 'events', v_events);
END;
$$;
REVOKE ALL ON FUNCTION public.partner_dashboard_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.partner_dashboard_summary(uuid) TO authenticated;
