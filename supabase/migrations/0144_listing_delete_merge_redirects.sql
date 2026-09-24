-- 0144: pengalihan otomatis saat listing dihapus atau digabung (M03 + url_redirects).
-- * Listing dihapus  -> /listing/{slug} dialihkan 302 ke /agent/{public_slug} pemilik (alasan 'listing_deleted').
--   Tanpa profil agen ber-slug, tidak ada pengalihan (halaman 404 biasa).
-- * Listing digabung -> merge_listings(source, target): lead dipindah ke target, source dihapus, /listing/{source}
--   dialihkan 301 ke /listing/{target} (alasan 'listing_merged'). Foto/video/riwayat harga/tayangan source tidak dipindah.
-- * Pengalihan lain yang menuju halaman yang dihapus ikut dialihkan ke tujuan baru (tanpa rantai mati).
-- * Listing baru yang memakai slug bekas dihapus membersihkan pengalihan lama agar tidak menutupi halaman baru.

CREATE OR REPLACE FUNCTION public.upsert_url_redirect(
  p_old text, p_new text, p_type smallint, p_reason text, p_entity_type text, p_entity_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_old IS NULL OR p_new IS NULL OR p_old = p_new THEN
    RETURN;
  END IF;
  BEGIN
    UPDATE public.url_redirects SET new_path = p_new WHERE new_path = p_old AND old_path <> p_new;
    DELETE FROM public.url_redirects WHERE old_path = p_new;
    INSERT INTO public.url_redirects (old_path, new_path, redirect_type, reason, entity_type, entity_id)
    VALUES (p_old, p_new, p_type, p_reason, p_entity_type, p_entity_id)
    ON CONFLICT (old_path) DO UPDATE
      SET new_path = EXCLUDED.new_path, redirect_type = EXCLUDED.redirect_type, reason = EXCLUDED.reason,
          entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'upsert_url_redirect gagal (% -> %): %', p_old, p_new, SQLERRM;
  END;
END;
$$;
REVOKE ALL ON FUNCTION public.upsert_url_redirect(text, text, smallint, text, text, uuid) FROM PUBLIC, anon, authenticated;

-- Trigger hapus listing: tujuan = target penggabungan (bila sedang merge) atau halaman profil agen.
CREATE OR REPLACE FUNCTION public.listing_delete_redirect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target text := nullif(current_setting('app.listing_merge_target', true), '');
  v_agent_slug text;
BEGIN
  IF OLD.slug IS NULL OR btrim(OLD.slug) = '' THEN
    RETURN OLD;
  END IF;
  IF v_target IS NOT NULL THEN
    PERFORM public.upsert_url_redirect('/listing/' || OLD.slug, '/listing/' || v_target, 301::smallint, 'listing_merged', 'listing', OLD.id);
    RETURN OLD;
  END IF;
  SELECT ap.public_slug INTO v_agent_slug FROM public.agent_profiles ap WHERE ap.user_id = OLD.agent_id;
  IF v_agent_slug IS NOT NULL AND btrim(v_agent_slug) <> '' THEN
    PERFORM public.upsert_url_redirect('/listing/' || OLD.slug, '/agent/' || v_agent_slug, 302::smallint, 'listing_deleted', 'listing', OLD.id);
  ELSE
    DELETE FROM public.url_redirects WHERE new_path = '/listing/' || OLD.slug;
  END IF;
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.listing_delete_redirect() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_listing_delete_redirect ON public.listings;
CREATE TRIGGER trg_listing_delete_redirect AFTER DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listing_delete_redirect();

-- Listing baru memakai slug bekas: hapus pengalihan lama untuk slug itu.
CREATE OR REPLACE FUNCTION public.listing_insert_clear_redirect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    DELETE FROM public.url_redirects WHERE old_path = '/listing/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.listing_insert_clear_redirect() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_listing_insert_clear_redirect ON public.listings;
CREATE TRIGGER trg_listing_insert_clear_redirect AFTER INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listing_insert_clear_redirect();

-- Gabung listing: pemanggil harus berhak menghapus source dan mengubah target; keduanya milik agen yang sama.
CREATE OR REPLACE FUNCTION public.merge_listings(p_source uuid, p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_src public.listings%ROWTYPE;
  v_tgt public.listings%ROWTYPE;
  v_moved int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'merge_listings: harus login' USING ERRCODE = '42501';
  END IF;
  IF p_source = p_target THEN
    RAISE EXCEPTION 'listings: listing sumber dan tujuan tidak boleh sama' USING ERRCODE = '23514';
  END IF;
  SELECT * INTO v_src FROM public.listings WHERE id = p_source FOR UPDATE;
  SELECT * INTO v_tgt FROM public.listings WHERE id = p_target FOR UPDATE;
  IF v_src.id IS NULL OR v_tgt.id IS NULL THEN
    RAISE EXCEPTION 'merge_listings: listing tidak ditemukan' USING ERRCODE = '42501';
  END IF;
  IF NOT (public.has_permission('m03.listing.delete', v_src.agent_id) AND public.has_permission('m03.listing.update', v_tgt.agent_id)) THEN
    RAISE EXCEPTION 'merge_listings: tidak berhak menggabungkan listing ini' USING ERRCODE = '42501';
  END IF;
  IF v_src.agent_id <> v_tgt.agent_id THEN
    RAISE EXCEPTION 'listings: listing sumber dan tujuan harus milik agen yang sama' USING ERRCODE = '23514';
  END IF;
  IF v_tgt.status <> 'published' THEN
    RAISE EXCEPTION 'listings: listing tujuan harus berstatus published agar pengalihan tidak menuju halaman kosong' USING ERRCODE = '23514';
  END IF;

  UPDATE public.listing_leads SET listing_id = p_target WHERE listing_id = p_source;
  GET DIAGNOSTICS v_moved = ROW_COUNT;

  PERFORM set_config('app.listing_merge_target', v_tgt.slug, true);
  DELETE FROM public.listings WHERE id = p_source;
  PERFORM set_config('app.listing_merge_target', '', true);

  RETURN jsonb_build_object('source_id', p_source, 'target_id', p_target, 'target_slug', v_tgt.slug, 'leads_moved', v_moved);
END;
$$;
REVOKE ALL ON FUNCTION public.merge_listings(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.merge_listings(uuid, uuid) TO authenticated;
