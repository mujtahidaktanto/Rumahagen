// app/api/listings/[id]/merge/route.ts
// POST /listings/{id}/merge { target_id } — gabungkan listing {id} (sumber) ke target_id (migration 0144, merge_listings()).
// Lead sumber dipindah ke target, sumber dihapus, dan /listing/{slug sumber} dialihkan 301 ke /listing/{slug target}. Foto/video/riwayat
// harga/tayangan sumber tidak ikut dipindah. Syarat: keduanya milik agen yang sama, target berstatus published. 42501 (tidak ditemukan atau
// tidak berhak) -> 403, 23514 (aturan bisnis) -> 409. Dipanggil dengan sesi pengguna (bukan service-role) karena fungsi memeriksa auth.uid().

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const mergeListingSchema = z.object({ target_id: z.string().uuid() });

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, mergeListingSchema);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("merge_listings", { p_source: ctx.params.id, p_target: body.target_id });
  if (error) {
    throwIntegrityError(error);
  }
  return { data };
});
