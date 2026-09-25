// app/api/admin/listings/[id]/approve/route.ts
// PUT /admin/listings/{id}/approve — API-037 (M03 Admin Listing Review,
// STEP11-A, PRESERVE, "exceptional/administrative capability only ...
// not normal publish authority" — admin-surface gap #1). Mengembalikan
// listing yang di-flag ke 'pending_review' kembali ke 'published' --
// "approve" dibaca sebagai membersihkan hasil moderasi (listing sudah
// pernah published sebelumnya, published_at TIDAK berubah), bukan publish
// pertama kali.
//
// SENGAJA memakai UPDATE sesi biasa (bukan admin client) supaya trigger
// enforce_listing_lifecycle_rules (0018/0086) TETAP menegakkan gate
// m03.listing.publish untuk transisi ke 'published' -- konsekuensi nyata
// dari master matrix yang SUDAH ADA (0009): Superadmin/Admin (scope 'all'
// untuk m03.listing.publish) BISA approve, tapi Manager (punya
// m03.listing.suspend tapi TIDAK PERNAH diberi m03.listing.publish sama
// sekali) akan ditolak trigger dengan 403 -- BUKAN bug, melainkan asimetri
// yang memang sudah didesain matrix: Manager boleh memoderasi/menolak,
// tapi otoritas mem-PUBLISH tetap Superadmin/Admin/Agent-pemilik saja.
// Diuji nyata (lihat migrations/README.md).

import { withApiHandler } from "@/lib/api/handler";
import { requirePermission } from "@/lib/api/require-permission";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requirePermission(
    supabase,
    "m03.listing.suspend",
    "Hanya staf (Superadmin/Admin/Manager) yang bisa memutuskan antrian review listing.",
  );

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
    throw new ApiError("CONFLICT", `Listing berstatus '${listing.status}' -- approve hanya berlaku untuk listing 'pending_review'.`);
  }

  const { data, error } = await supabase
    .from("listings")
    .update({ status: "published" })
    .eq("id", ctx.params.id)
    .eq("status", "pending_review")
    .select()
    .maybeSingle();

  if (error) {
    // Trigger enforce_listing_lifecycle_rules RAISE EXCEPTION untuk transisi
    // 'published' tanpa permission m03.listing.publish -- pola sama seperti
    // app/api/listings/[id]/status/route.ts.
    if (typeof error.message === "string" && error.message.includes("m03.listing.publish")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("CONFLICT", "Status listing berubah sebelum approve diproses -- coba lagi.");
  }

  await logAuditEvent(ctx.userId, {
    p_action: "m03.listing.approve",
    p_entity_type: "listings",
    p_entity_id: data.id,
    p_new_value: { status: data.status },
  });

  return { data };
});
