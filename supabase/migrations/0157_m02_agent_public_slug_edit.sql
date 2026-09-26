-- 0157_m02_agent_public_slug_edit.sql
-- Alamat profil publik Agent (`agent_profiles.public_slug`, tampil sebagai /agen/{slug}) sebelumnya dibuat SEKALI saat profil pertama disimpan (nama + 8 karakter user_id) dan tidak bisa
-- diubah. Keputusan pemilik produk 2026-09-26: Agent boleh mengubahnya sendiri, dengan pengecekan ketersediaan sebelum disimpan dan batas MAKSIMAL 1 KALI per bulan kalender (reset tanggal 1,
-- zona Asia/Jakarta). Tautan lama dialihkan 301 ke yang baru.
--
--  * Kolom baru `slug_changed_at` (kapan terakhir diganti; NULL = belum pernah diganti, jadi penggantian pertama dari slug otomatis selalu boleh). Tidak bisa diisi langsung oleh pengguna.
--  * Aturan slug baru: huruf kecil, angka, tanda hubung (tanpa tanda hubung di tepi/ganda), panjang 3-60, bukan kata dicadangkan (nama halaman/area aplikasi), belum dipakai profil lain,
--    dan bukan alamat lama profil lain (url_redirects) agar tautan yang sudah beredar tidak dibajak. Alamat lama profil SENDIRI boleh dipakai kembali.
--  * Perbaikan: trigger pengalihan lama memakai awalan '/agent/' (area aplikasi Agent), padahal alamat publik profil = '/agen/'. Diganti '/agen/'.
--  * RPC `check_my_agent_slug(p_slug)` untuk pengecekan sebelum simpan: mengembalikan tersedia/alasan, apakah bulan ini masih boleh mengganti, dan kapan boleh lagi.
-- Penegakan akhir tetap di trigger database (dua orang bisa memilih nama sama bersamaan: UNIQUE + trigger menolak yang kedua).

ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS slug_changed_at timestamptz;
COMMENT ON COLUMN public.agent_profiles.slug_changed_at IS 'Terakhir kali public_slug diganti oleh Agent (NULL = belum pernah). Batas 1x per bulan kalender WIB (trigger enforce_agent_slug_change). Diisi trigger, bukan klien.';

-- Kata yang tidak boleh menjadi alamat profil (nama halaman/area aplikasi dan kata sistem).
CREATE OR REPLACE FUNCTION public.is_reserved_agent_slug(p_slug text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p_slug = ANY (ARRAY[
    'baru', 'admin', 'agent', 'agen', 'api', 'login', 'daftar', 'portal', 'komponen', 'promo', 'konten', 'event', 'learning', 'learning-session', 'developer', 'organisasi',
    'listing', 'project', 'verifikasi', 'akun-dibatasi', 'lupa-password', 'sitemap', 'robots', 'rumahagen', 'staf', 'staff', 'partner', 'instructor', 'notifikasi', 'profil', 'bantuan'
  ]);
$$;

-- Masalah pada slug calon (NULL = bisa dipakai). p_profile_id = profil pemilik (dikecualikan dari cek "sudah dipakai"). Hanya kode alasan; tidak membocorkan siapa pemakainya.
CREATE OR REPLACE FUNCTION public.agent_slug_problem(p_slug text, p_profile_id uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_slug IS NULL OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RETURN 'format'; END IF;
  IF length(p_slug) < 3 OR length(p_slug) > 60 THEN RETURN 'panjang'; END IF;
  IF public.is_reserved_agent_slug(p_slug) THEN RETURN 'dicadangkan'; END IF;
  IF EXISTS (SELECT 1 FROM public.agent_profiles WHERE public_slug = p_slug AND id IS DISTINCT FROM p_profile_id) THEN RETURN 'dipakai'; END IF;
  IF EXISTS (SELECT 1 FROM public.url_redirects WHERE old_path = '/agen/' || p_slug AND entity_id IS DISTINCT FROM p_profile_id) THEN RETURN 'dipakai'; END IF;
  RETURN NULL;
END;
$$;
-- authenticated perlu EXECUTE karena trigger enforce_agent_slug_change berjalan sebagai pemanggil; fungsi hanya mengembalikan kode alasan.
REVOKE ALL ON FUNCTION public.agent_slug_problem(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.agent_slug_problem(text, uuid) TO authenticated;

-- Awal bulan kalender berikutnya (WIB) sebagai timestamptz.
CREATE OR REPLACE FUNCTION public.next_wib_month_start(p_from timestamptz DEFAULT now())
RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT (date_trunc('month', p_from AT TIME ZONE 'Asia/Jakarta') + interval '1 month') AT TIME ZONE 'Asia/Jakarta';
$$;

CREATE OR REPLACE FUNCTION public.enforce_agent_slug_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_problem text;
BEGIN
  -- Tulis internal (service role/skrip): tanpa pembatasan.
  IF current_user NOT IN ('authenticated', 'anon') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.public_slug IS NOT DISTINCT FROM OLD.public_slug THEN
    -- slug tidak berubah: penanda waktu tidak boleh diatur klien.
    NEW.slug_changed_at := OLD.slug_changed_at;
    RETURN NEW;
  END IF;

  v_problem := public.agent_slug_problem(NEW.public_slug, OLD.id);
  IF v_problem IS NOT NULL THEN
    RAISE EXCEPTION 'agent_profiles: %', CASE v_problem
      WHEN 'format' THEN 'alamat profil hanya boleh huruf kecil, angka, dan tanda hubung (mis. andi-pratama).'
      WHEN 'panjang' THEN 'alamat profil harus 3 sampai 60 karakter.'
      WHEN 'dicadangkan' THEN 'alamat profil itu dicadangkan sistem. Pilih alamat lain.'
      ELSE 'alamat profil sudah dipakai. Pilih alamat lain.' END
      USING ERRCODE = '23514';
  END IF;

  IF OLD.slug_changed_at IS NOT NULL
     AND date_trunc('month', OLD.slug_changed_at AT TIME ZONE 'Asia/Jakarta') = date_trunc('month', now() AT TIME ZONE 'Asia/Jakarta') THEN
    RAISE EXCEPTION 'agent_profiles: alamat profil hanya bisa diganti 1 kali per bulan kalender; bisa diganti lagi mulai % WIB.', to_char(public.next_wib_month_start() AT TIME ZONE 'Asia/Jakarta', 'DD-MM-YYYY')
      USING ERRCODE = '23514';
  END IF;

  NEW.slug_changed_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_agent_slug_change ON public.agent_profiles;
CREATE TRIGGER trg_enforce_agent_slug_change BEFORE UPDATE OF public_slug, slug_changed_at ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_slug_change();

-- Pengalihan 301 lama -> baru memakai alamat publik '/agen/' (sebelumnya '/agent/', area aplikasi).
CREATE OR REPLACE FUNCTION public.trg_agent_slug_redirect()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.public_slug IS DISTINCT FROM OLD.public_slug THEN
    PERFORM public.create_slug_redirect('/agen/', OLD.public_slug, NEW.public_slug, 'agent_profile', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Pengecekan sebelum simpan (untuk pemanggil yang login, profil sendiri).
CREATE OR REPLACE FUNCTION public.check_my_agent_slug(p_slug text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prof record;
  v_problem text;
  v_can boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'check_my_agent_slug: login diperlukan' USING ERRCODE = '42501';
  END IF;
  SELECT id, public_slug, slug_changed_at INTO v_prof FROM public.agent_profiles WHERE user_id = auth.uid() AND deleted_at IS NULL;
  IF v_prof.id IS NULL THEN
    RETURN jsonb_build_object('available', false, 'reason', 'belum_ada_profil', 'can_change', false, 'current_slug', NULL, 'last_changed_at', NULL, 'next_change_at', NULL);
  END IF;
  v_can := v_prof.slug_changed_at IS NULL
           OR date_trunc('month', v_prof.slug_changed_at AT TIME ZONE 'Asia/Jakarta') <> date_trunc('month', now() AT TIME ZONE 'Asia/Jakarta');
  IF p_slug IS NOT DISTINCT FROM v_prof.public_slug THEN
    v_problem := 'sama';
  ELSE
    v_problem := public.agent_slug_problem(lower(btrim(p_slug)), v_prof.id);
  END IF;
  RETURN jsonb_build_object(
    'available', v_problem IS NULL,
    'reason', v_problem,
    'can_change', v_can,
    'current_slug', v_prof.public_slug,
    'last_changed_at', v_prof.slug_changed_at,
    'next_change_at', CASE WHEN v_can THEN NULL ELSE public.next_wib_month_start() END
  );
END;
$$;
REVOKE ALL ON FUNCTION public.check_my_agent_slug(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_my_agent_slug(text) TO authenticated;
