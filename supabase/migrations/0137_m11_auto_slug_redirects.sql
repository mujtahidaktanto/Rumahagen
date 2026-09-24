-- 0137_m11_auto_slug_redirects.sql
-- Pengalihan URL otomatis saat slug publik berubah. Tabel url_redirects (0051) hanya berisi input manual staf dan tidak dipakai aplikasi publik;
-- saat slug listing, proyek developer, atau profil agen berubah, tautan lama (yang sudah diindeks mesin pencari/dibagikan) menjadi 404.
-- Aplikasi publik kini membaca url_redirects lewat middleware (apps/web/middleware.ts), jadi entri otomatis langsung berlaku.
--
-- Model:
--   * Perubahan slug pada listing berstatus `published`, proyek developer yang tampil publik (active|coming_soon|sold_out), dan `agent_profiles.public_slug`
--     membuat (atau memperbarui) pengalihan 301 `/listing/{lama}` -> `/listing/{baru}`, `/project/...`, `/agent/...` dengan alasan `slug_changed`
--     dan `entity_type`/`entity_id` terisi.
--   * Rantai diratakan: pengalihan lama yang menuju slug yang baru ditinggalkan diarahkan langsung ke slug terbaru (A->B lalu B->C menjadi A->C dan B->C).
--   * Slug dikembalikan ke nilai lama: pengalihan dari slug itu dihapus supaya tidak membentuk putaran.
--   * Kegagalan membuat pengalihan tidak pernah menggagalkan perubahan slug (hanya WARNING).
-- Tidak ada perubahan pada listing/proyek/profil yang sudah ada; tabel url_redirects kosong saat migration ini ditulis (dicek live).

CREATE OR REPLACE FUNCTION public.create_slug_redirect(
  p_prefix text, p_old_slug text, p_new_slug text, p_entity_type text, p_entity_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old text;
  v_new text;
BEGIN
  IF p_old_slug IS NULL OR p_new_slug IS NULL OR p_old_slug = p_new_slug OR btrim(p_old_slug) = '' OR btrim(p_new_slug) = '' THEN
    RETURN;
  END IF;
  v_old := p_prefix || p_old_slug;
  v_new := p_prefix || p_new_slug;
  BEGIN
    -- Kembali ke slug lama: hapus pengalihan dari slug itu agar tidak berputar.
    DELETE FROM public.url_redirects WHERE old_path = v_new;
    -- Ratakan rantai: yang menuju slug lama sekarang menuju slug terbaru.
    UPDATE public.url_redirects SET new_path = v_new WHERE new_path = v_old;
    INSERT INTO public.url_redirects (old_path, new_path, redirect_type, reason, entity_type, entity_id)
    VALUES (v_old, v_new, 301, 'slug_changed', p_entity_type, p_entity_id)
    ON CONFLICT (old_path) DO UPDATE
      SET new_path = EXCLUDED.new_path, redirect_type = 301, reason = 'slug_changed',
          entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'create_slug_redirect gagal (% -> %): %', v_old, v_new, SQLERRM;
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.create_slug_redirect(text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_listing_slug_redirect()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'published' AND NEW.slug IS DISTINCT FROM OLD.slug THEN
    PERFORM public.create_slug_redirect('/listing/', OLD.slug, NEW.slug, 'listing', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_listing_slug_redirect ON public.listings;
CREATE TRIGGER trg_listing_slug_redirect AFTER UPDATE OF slug ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.trg_listing_slug_redirect();

CREATE OR REPLACE FUNCTION public.trg_project_slug_redirect()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IN ('active', 'coming_soon', 'sold_out') AND NEW.slug IS DISTINCT FROM OLD.slug THEN
    PERFORM public.create_slug_redirect('/project/', OLD.slug, NEW.slug, 'developer_project', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_project_slug_redirect ON public.developer_projects;
CREATE TRIGGER trg_project_slug_redirect AFTER UPDATE OF slug ON public.developer_projects
  FOR EACH ROW EXECUTE FUNCTION public.trg_project_slug_redirect();

CREATE OR REPLACE FUNCTION public.trg_agent_slug_redirect()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.public_slug IS DISTINCT FROM OLD.public_slug THEN
    PERFORM public.create_slug_redirect('/agent/', OLD.public_slug, NEW.public_slug, 'agent_profile', NEW.id);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_agent_slug_redirect ON public.agent_profiles;
CREATE TRIGGER trg_agent_slug_redirect AFTER UPDATE OF public_slug ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_agent_slug_redirect();
