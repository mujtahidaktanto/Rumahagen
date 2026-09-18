-- 0090_fix_listings_update_rls_for_suspend.sql
-- Bug ditemukan lewat testing nyata migration 0086 (T2-1): RLS
-- `listings_update` (0018) USING clause HANYA mengecek
-- `has_permission('m03.listing.update', agent_id)` -- permission itu CUMA
-- diberikan ke superadmin(all)+agent(own) (0009), TIDAK PERNAH ke
-- admin/manager. Trigger `enforce_listing_lifecycle_rules()` (0086)
-- mengecek `m03.listing.suspend` (staf-only) DI DALAM trigger, TAPI baris
-- itu sendiri sudah difilter habis oleh RLS USING SEBELUM trigger sempat
-- jalan -- Manager/Admin yang punya permission suspend tetap dapat 0 baris
-- (NOT_FOUND), bukan benar-benar bisa suspend. Dikonfirmasi lewat test
-- nyata: Manager PATCH /listings/{id}/status (suspended) -> 404, bukan 200.

DROP POLICY IF EXISTS listings_update ON public.listings;
CREATE POLICY listings_update ON public.listings
  FOR UPDATE USING (
    public.has_permission('m03.listing.update', agent_id)
    OR public.has_permission('m03.listing.suspend', agent_id)
  );

COMMENT ON POLICY listings_update ON public.listings IS
  'DIPERBAIKI 0090: ditambah OR has_permission(m03.listing.suspend) supaya staf (Manager/Admin/Superadmin) yang punya permission suspend enforcement (0086) benar-benar bisa mencapai baris untuk di-UPDATE -- sebelumnya cuma m03.listing.update (superadmin+agent-own) yang lolos RLS, membuat permission suspend staf tidak pernah efektif walau trigger-nya benar.';
