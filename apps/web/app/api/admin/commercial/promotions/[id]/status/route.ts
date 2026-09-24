// app/api/admin/commercial/promotions/[id]/status/route.ts
// ADD-NEW — PATCH status promosi (draft/active/inactive/expired). Mengaktifkan butuh benefit valid (CHECK migration 0133) dan masa berlaku
// yang belum lewat; pelanggaran dikembalikan sebagai 422. Menonaktifkan tidak mengubah pesanan yang sudah ada.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { promotionStatusSchema } from "@/lib/validation/commercial-promotions";
import { derivePromotionState } from "@/lib/commercial/promotion-state";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, promotionStatusSchema);
  const supabase = await createClient();

  if (body.status === "active") {
    const { data: current, error: currentError } = await supabase
      .from("promotions")
      .select("valid_to")
      .eq("id", ctx.params.id)
      .maybeSingle();
    if (currentError) {
      throw currentError;
    }
    if (!current) {
      throw new ApiError("NOT_FOUND", "Promosi tidak ditemukan atau Anda tidak punya akses.");
    }
    if (current.valid_to && new Date(current.valid_to).getTime() < Date.now()) {
      throw new ApiError("VALIDATION_ERROR", "Masa berlaku promosi sudah lewat; ubah valid_to sebelum mengaktifkan.");
    }
  }

  const { data, error } = await supabase
    .from("promotions")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Promosi aktif wajib punya benefit valid (percent_off atau amount_off).");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Promosi tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data: { ...data, ...derivePromotionState(data) } };
});
