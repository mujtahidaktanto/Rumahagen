// lib/listings/create-lead.ts
// Logika bersama untuk API-044 POST /leads dan API-045 POST
// /listings/{id}/cta-click — keduanya menulis ke listing_leads (M03,
// migration 0047), beda hanya cara listing_id diberikan (body vs path).
// `agent_id` diisi dari listings.agent_id milik listing tsb (pemilik
// listing SAAT lead tercatat), bukan dari body — mencegah klien
// menyuntikkan agent_id sembarang.
//
// TIDAK memakai `.select()` setelah `.insert()` — listing_leads_select
// dibatasi pemilik listing/staf, BUKAN publik, jadi RETURNING akan ditolak
// untuk pengunjung anonim (gotcha arsitektural yang sama seperti
// listing_views/listing_photos, didokumentasikan di
// supabase/migrations/README.md sejak testing Fase 1 migration).

import { ApiError } from "@/lib/api/errors";
import type { createClient } from "@/lib/supabase/server";

export async function createListingLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  source: string | undefined,
  request: Request,
) {
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, agent_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    throw listingError;
  }
  if (!listing) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan.");
  }

  const { error } = await supabase.from("listing_leads").insert({
    listing_id: listing.id,
    agent_id: listing.agent_id,
    source: source ?? "whatsapp_cta",
    ip_address: request.headers.get("x-forwarded-for"),
    user_agent: request.headers.get("user-agent"),
  });

  if (error) {
    throw error;
  }

  return { listing_id: listing.id, recorded: true };
}
