-- 0107_fix_listings_pending_review_self_unflag.sql
-- Ditemukan saat membangun Listing Moderation Queue (M03 Admin Listing
-- Review, API-036/037/038 -- admin-surface gap #1, "manual review
-- pasca-publish", BUKAN gate publish normal, dikonfirmasi user).
--
-- CELAH: trigger enforce_listing_lifecycle_rules (0018/0086) hanya
-- menggerbangi transisi KE 'published' dengan m03.listing.publish (scope
-- 'own' untuk Agent) dan transisi ke/dari 'suspended' dengan
-- m03.listing.suspend (staff-only). Transisi ke/dari 'pending_review'
-- TIDAK punya gate permission khusus apa pun -- artinya begitu staf
-- menandai listing seorang Agent sebagai 'pending_review' (mis. lewat
-- PATCH /listings/{id}/status yang sudah ada), Agent pemilik listing itu
-- SENDIRI bisa langsung memanggil endpoint yang sama untuk
-- mengembalikannya ke 'published' -- mereka tetap punya m03.listing.publish
-- scope 'own' untuk listing miliknya, dan tidak ada apa pun yang
-- memeriksa status LAMA-nya. Ini sepenuhnya meniadakan tujuan endpoint
-- GET/PUT /admin/listings/pending/approve/reject yang baru dibangun:
-- Agent bisa self-un-flag tanpa review staf sama sekali.
--
-- Diverifikasi nyata sebelum fix: Agent PATCH /listings/{id}/status
-- {"status":"published"} pada listing miliknya sendiri yang sedang
-- 'pending_review' -> 200 OK, kembali published tanpa staf terlibat.
--
-- FIX: tambah IF block baru, SIMETRIS dengan pola 'suspended' yang sudah
-- ada -- transisi ke/dari 'pending_review' (arah manapun) butuh permission
-- m03.listing.suspend (staff-only, TIDAK diberikan ke Agent sama sekali
-- sejak 0086). Setelah fix ini, transisi pending_review->published (yaitu
-- "approve") butuh KEDUA permission (m03.listing.suspend UNTUK keluar dari
-- antrian moderasi, m03.listing.publish UNTUK benar-benar publish) --
-- konsekuensi: Superadmin/Admin (punya keduanya) bisa approve, Manager
-- (punya suspend tapi tidak pernah diberi publish) tetap 403 di approve
-- (didokumentasikan sebagai asimetri desain matrix yang memang disengaja,
-- bukan bug, di app/api/admin/listings/[id]/approve/route.ts). Reject
-- (ke 'rejected', tidak ada gate publish) tetap bisa oleh ketiga role staf.

CREATE OR REPLACE FUNCTION public.enforce_listing_lifecycle_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
    RAISE EXCEPTION 'listings: agent_id (kepemilikan) tidak boleh diubah lewat UPDATE';
  END IF;

  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    IF NOT public.has_permission('m03.listing.publish', OLD.agent_id) THEN
      RAISE EXCEPTION 'listings: transisi ke published butuh permission m03.listing.publish (Gate PRE-00-E §6-9)';
    END IF;
    IF OLD.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;

  IF (NEW.status = 'suspended') IS DISTINCT FROM (OLD.status = 'suspended') THEN
    IF NOT public.has_permission('m03.listing.suspend', OLD.agent_id) THEN
      RAISE EXCEPTION 'listings: transisi ke/dari suspended butuh permission m03.listing.suspend (Gate PRE-00-E §10, enforcement state)';
    END IF;
  END IF;

  -- (BARU 0107) Transisi ke/dari pending_review (moderation flag) --
  -- simetris dengan blok suspended di atas, permission yang sama (staf
  -- enforcement), menutup celah self-un-flag oleh Agent pemilik listing.
  IF (NEW.status = 'pending_review') IS DISTINCT FROM (OLD.status = 'pending_review') THEN
    IF NOT public.has_permission('m03.listing.suspend', OLD.agent_id) THEN
      RAISE EXCEPTION 'listings: transisi ke/dari pending_review butuh permission m03.listing.suspend (moderation flag, staff-only)';
    END IF;
  END IF;

  IF OLD.published_at IS NOT NULL THEN
    IF NEW.address IS DISTINCT FROM OLD.address
       OR NEW.property_type IS DISTINCT FROM OLD.property_type
       OR NEW.land_area IS DISTINCT FROM OLD.land_area
       OR NEW.building_area IS DISTINCT FROM OLD.building_area
    THEN
      RAISE EXCEPTION 'listings: address/property_type/land_area/building_area terkunci permanen setelah publish pertama (Gate PRE-00-E §13)';
    END IF;
  END IF;

  IF NEW.last_refreshed_at IS DISTINCT FROM OLD.last_refreshed_at THEN
    IF current_setting('rumahagen.refresh_in_progress', true) IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'listings: last_refreshed_at hanya boleh diubah lewat refresh_listing() (R-04) — UPDATE langsung ke kolom ini ditolak';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON CONSTRAINT listings_status_check ON public.listings IS
  'DIPERLUAS 0086 (nilai ''suspended''), DIPERBAIKI 0107: transisi ke/dari ''pending_review'' kini JUGA digerbangi permission m03.listing.suspend (staff-only) di trigger enforce_listing_lifecycle_rules() -- sebelumnya tidak ada gate sama sekali, membuat Agent bisa self-un-flag listingnya sendiri dari antrian moderasi.';
