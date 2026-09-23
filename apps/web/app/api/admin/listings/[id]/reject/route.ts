// app/api/admin/listings/[id]/reject/route.ts
// PUT /admin/listings/{id}/reject — API-038 (M03 Admin Listing Review,
// STEP11-A, PRESERVE — admin-surface gap #1). Menolak listing yang sedang
// 'pending_review' -- status jadi 'rejected', rejection_reason (kolom
// sudah ada sejak 0018, dipakai ulang dari PATCH /listings/{id}/status)
// opsional diisi.
//
// Tidak ada IF block permission tambahan di trigger untuk transisi KE
// 'rejected' (tidak seperti 'published'/'suspended') -- m03.listing.suspend
// (staf, Superadmin/Admin/Manager = all) sudah cukup untuk lolos RLS
// listings_update (0090), jadi ketiga role staf BISA reject (tidak ada
// asimetri seperti approve/publish di atas).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { rejectListingSchema } from "@/lib/validation/listings";
import { requirePermission } from "@/lib/api/require-permission";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requirePermission(
    supabase,
    "m03.listing.suspend",
    "Hanya staf (Superadmin/Admin/Manager) yang bisa memutuskan antrian review listing.",
  );

  const body = await validateJsonBody(ctx.request, rejectListingSchema);

  const { data: listing, error: findErr } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!listing) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan.");
  }
  if (listing.status !== "pending_review") {
    throw new ApiError("CONFLICT", `Listing berstatus '${listing.status}' -- reject hanya berlaku untuk listing 'pending_review'.`);
  }

  const { data, error } = await supabase
    .from("listings")
    .update({ status: "rejected", ...(body.rejection_reason ? { rejection_reason: body.rejection_reason } : {}) })
    .eq("id", ctx.params.id)
    .eq("status", "pending_review")
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("CONFLICT", "Status listing berubah sebelum reject diproses -- coba lagi.");
  }

  await supabase.rpc("log_audit_event", {
    p_action: "m03.listing.reject",
    p_entity_type: "listings",
    p_entity_id: data.id,
    p_new_value: { status: data.status, rejection_reason: data.rejection_reason },
  });

  return { data };
});
