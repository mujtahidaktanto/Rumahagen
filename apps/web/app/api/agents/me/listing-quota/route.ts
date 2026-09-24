// app/api/agents/me/listing-quota/route.ts
// GET /agents/me/listing-quota — kuota penerbitan listing (M03 x M14, migration 0140/0141) untuk pengguna login.
// Tanpa parameter: kuota PRIBADI. Dengan ?organization_id=...: kuota ORGANISASI (dipakai bersama anggota; hanya anggota aktif atau staf).
// Rincian: Gratis (reset tgl 1 kalender WIB), Pro (reset per siklus bulanan langganan, di atas Gratis), slot beli (tidak reset/kedaluwarsa),
// total_remaining, serta validity_days/grace_days (masa tayang tiap jatah). Jatah dipakai berurutan Gratis -> Pro -> slot beli saat listing terbit.
// Logika seluruhnya di database (RPC listing_quota_summary); route ini hanya membungkusnya.

import { withApiHandler } from "@/lib/api/handler";
import { validateSearchParams } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { listingQuotaQuerySchema, type ListingQuotaSummary } from "@/lib/validation/listing-quota";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat kuota listing.");
  }

  const filters = validateSearchParams(new URL(ctx.request.url).searchParams, listingQuotaQuerySchema);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("listing_quota_summary", {
    p_organization_id: filters.organization_id ?? null,
  });

  if (error) {
    if (error.code === "42501") {
      throw new ApiError("FORBIDDEN", "Anda bukan anggota aktif organisasi ini.");
    }
    throw error;
  }

  return { data: data as ListingQuotaSummary };
});
