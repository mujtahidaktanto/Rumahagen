-- 0114_listing_leads_status.sql
-- Menutup gap agen/user #2: PUT /leads/{id}/status (API-049, M03,
-- STEP11-B2 "Preserve lead status mutation route under existing
-- authorization"). Route-nya TERKUNCI, TAPI STEP11-B2 sendiri eksplisit:
-- "The accepted physical baseline contains listing_leads with listing_id
-- -> listings.id and agent_id -> users.id, source default 'whatsapp_cta',
-- plus IP/user-agent/timestamp evidence. NO NEW LEAD TABLE OR ENDPOINT IS
-- INTRODUCED BY B2." -- `listing_leads` (0047) TIDAK PUNYA kolom status
-- sama sekali (murni log kejadian klik CTA) -- tidak ada satu pun nama
-- nilai status yang dievidensi di seluruh korpus Core (dicek menyeluruh).
--
-- KEPUTUSAN REKAYASA (kolom ADD-NEW, vocabulary tidak dikarang bebas --
-- mengikuti lifecycle CRM lead paling minimal/standar, konsisten pola
-- "SCOPE MINIMAL evidence-respecting" yang sudah dipakai
-- app/api/agents/me/leads/stats/route.ts untuk resource yang sama):
--   new       -- default, baru tercatat dari klik CTA
--   contacted -- Agent sudah menghubungi
--   converted -- jadi transaksi/klien
--   lost      -- tidak berlanjut
--
-- OTORISASI: RLS UPDATE baru meniru PERSIS logika listing_leads_select
-- yang sudah ada (has_permission('m03.listing.update', l.agent_id)) --
-- siapa pun yang bisa LIHAT detail lead (pemilik listing + Superadmin),
-- bisa UBAH statusnya -- konsisten satu sumber otorisasi (R-02), tidak
-- menciptakan permission baru.

ALTER TABLE public.listing_leads
  ADD COLUMN status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'converted', 'lost'));

COMMENT ON COLUMN public.listing_leads.status IS
  'ADD-NEW 0114 (API-049) -- tidak ada di STEP10-D dictionary, vocabulary keputusan rekayasa (new/contacted/converted/lost) karena tidak ada nilai yang dievidensi Core.';

CREATE POLICY listing_leads_update ON public.listing_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_leads.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_leads.listing_id AND public.has_permission('m03.listing.update', l.agent_id)
    )
  );
