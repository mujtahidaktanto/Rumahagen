// app/api/admin/commercial/addons/[id]/status/route.ts
// ADD-NEW — PATCH status addon (draft/active/inactive). Mengaktifkan butuh harga > 0 dan kapasitas primer (CHECK migration 0131/0132);
// pelanggaran dikembalikan sebagai 422.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { addonStatusSchema } from "@/lib/validation/commercial-addons";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, addonStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addons")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Addon aktif wajib punya harga lebih dari 0 dan kapasitas primer.");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Addon tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
