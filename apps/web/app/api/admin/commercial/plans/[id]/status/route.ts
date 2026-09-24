// app/api/admin/commercial/plans/[id]/status/route.ts
// PATCH status paket (draft/active/inactive). Mengaktifkan butuh minimal satu harga (CHECK migration 0142); pelanggaran dikembalikan sebagai 422.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { planStatusSchema } from "@/lib/validation/commercial-plans";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, planStatusSchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();
  if (error) {
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Paket aktif wajib punya minimal satu harga (pribadi atau organisasi).");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Paket tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
