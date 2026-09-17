-- 0053_performance_indexes_fk_phase1.sql
-- ADD-NEW — penutup Fase 1 (0047-0052) dari rencana "100% tabel". Menambah
-- index B-tree pada kolom FK yang ditandai "Unindexed foreign keys" oleh
-- Supabase Performance Advisor setelah 0047-0052 diterapkan — pola dan
-- alasan PERSIS sama seperti 0038 (index membuat validasi FK constraint dan
-- subquery JOIN di RLS jadi O(log n), bukan sequential scan O(n)).
--
-- Tidak termasuk: `listing_amenities.listing_id` (kolom pertama PRIMARY KEY
-- komposit, sudah otomatis punya index leftmost-prefix — pola sama seperti
-- catatan di 0038), `url_redirects.entity_id` (bukan FK fisik, referensi
-- longgar seperti audit_logs.entity_id).
--
-- Seluruh tabel di sini masih kosong saat migration ditulis — CREATE INDEX
-- biasa (bukan CONCURRENTLY) aman dan instan, sama seperti 0038.

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON public.listing_photos (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_videos_listing_id ON public.listing_videos (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_price_history_listing_id ON public.listing_price_history (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views (listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_leads_listing_id ON public.listing_leads (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_leads_agent_id ON public.listing_leads (agent_id);

CREATE INDEX IF NOT EXISTS idx_listing_amenities_amenity_id ON public.listing_amenities (amenity_id);

CREATE INDEX IF NOT EXISTS idx_ref_villages_district_id ON public.ref_villages (district_id);

CREATE INDEX IF NOT EXISTS idx_agent_verification_documents_user_id ON public.agent_verification_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_agent_verification_documents_reviewed_by ON public.agent_verification_documents (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_organization_document_organization_id ON public.organization_document (organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON public.organization_invitations (organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_agent_id ON public.organization_invitations (agent_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_leader_id ON public.organization_invitations (leader_id);

CREATE INDEX IF NOT EXISTS idx_dbr_simulations_agent_id ON public.dbr_simulations (agent_id);
CREATE INDEX IF NOT EXISTS idx_dbr_simulations_listing_id ON public.dbr_simulations (listing_id);
