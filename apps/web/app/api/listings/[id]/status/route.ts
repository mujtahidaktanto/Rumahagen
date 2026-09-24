// app/api/listings/[id]/status/route.ts
// API-028 PATCH /listings/{id}/status — mutasi lifecycle (mis. publish, sold,
// rented, expired, rejected). Sumber semantik: STEP11-B2 §6 — "Normal
// publication is DRAFT -> PUBLISHED"; F11-B2-003: "Do not broaden 'authorized
// admin' into a generic Admin grant. Final role/permission resolution remains
// M10-owned."
//
// Transisi ke 'published' digerbangi permission m03.listing.publish yang
// TERPISAH dari m03.listing.update, ditegakkan trigger
// trg_listing_lifecycle_rules (0018) — bukan logika baru di route ini (R-02).
// Route ini hanya melakukan UPDATE status biasa dan membiarkan RLS+trigger
// yang memutuskan boleh/tidaknya. Publish juga mengonsumsi jatah kuota (0140): kuota habis -> 409 (details.reason = listing_quota_exhausted).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { listingStatusSchema } from "@/lib/validation/listings";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, listingStatusSchema);
  const supabase = await createClient();

  const update: Record<string, unknown> = { status: body.status };
  if (body.status === "rejected" && body.rejection_reason) {
    update.rejection_reason = body.rejection_reason;
  }
  if (body.status === "sold" || body.status === "rented") {
    update.sold_or_rented_at = new Date().toISOString();
  }
  if (body.status === "expired") {
    update.expired_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("listings")
    .update(update)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    // Trigger trg_listing_lifecycle_rules RAISE EXCEPTION untuk transisi
    // 'published' tanpa permission m03.listing.publish — bedakan dari error
    // tak terduga supaya client dapat 403, bukan 500 generik.
    if (
      typeof error.message === "string" &&
      (error.message.includes("m03.listing.publish") || error.message.includes("m03.listing.suspend"))
    ) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    // Kuota listing habis / aturan organisasi (0140): 23514 -> 409 dengan pesan bahasa pengguna.
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan atau Anda tidak punya akses untuk mengubah statusnya.");
  }

  return { data };
});
