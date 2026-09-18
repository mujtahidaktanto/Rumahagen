-- 0086_add_listing_suspended_enforcement_state.sql
-- Menutup temuan Tier 2 T2-1 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-E_M03_LISTING_REFRESH_
-- GATE_FULL_v1.1.md` §10 mengunci `SUSPENDED` sebagai enforcement state
-- untuk pelanggaran aturan platform/kode etik — eksplisit "bukan pengganti
-- PENDING_REVIEW" (§10). `listings_status_check` (0018) tidak pernah
-- punya nilai ini sama sekali (STEP10-D melestarikan definisi lama tanpa
-- disilangkan ke kunci §10 -- pola sama seperti bug 0002/0083).
--
-- Mengikuti pola yang SUDAH ADA di trigger 0018 untuk transisi ke
-- 'published' (permission KHUSUS `m03.listing.publish`, bukan sekadar
-- `m03.listing.update`) -- transisi ke/dari 'suspended' butuh permission
-- BARU `m03.listing.suspend`, HANYA staf (Superadmin/Admin/Manager),
-- TIDAK diberikan ke Agent sama sekali -- konsisten dengan makna
-- "enforcement state" (bukan aksi self-service pemilik listing).

ALTER TABLE public.listings DROP CONSTRAINT listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('draft', 'pending_review', 'published', 'sold', 'rented', 'expired', 'rejected', 'suspended'));

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m03', 'm03.listing.suspend', 'all', 'Listing - Suspend (ADD-NEW/0086; Gate PRE-00-E §10: SUSPENDED adalah enforcement state pelanggaran platform, staff-only, bukan pengganti pending_review)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM (VALUES ('superadmin'), ('admin'), ('manager')) AS x(role_code)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = 'm03.listing.suspend'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CREATE OR REPLACE menambah SATU IF block baru ke fungsi 0018 -- 3 aturan
-- lama (publish gate, field lock, refresh guard) dipertahankan verbatim.
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

  -- (BARU 0086) Transisi ke/dari suspended adalah enforcement staff-only.
  IF (NEW.status = 'suspended') IS DISTINCT FROM (OLD.status = 'suspended') THEN
    IF NOT public.has_permission('m03.listing.suspend', OLD.agent_id) THEN
      RAISE EXCEPTION 'listings: transisi ke/dari suspended butuh permission m03.listing.suspend (Gate PRE-00-E §10, enforcement state)';
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
  'DIPERLUAS 0086: menambah nilai ''suspended'' (Gate PRE-00-E §10, enforcement state pelanggaran platform). Transisi ke/dari nilai ini digerbangi permission m03.listing.suspend (staff-only) di trigger enforce_listing_lifecycle_rules(), bukan RLS UPDATE biasa.';
