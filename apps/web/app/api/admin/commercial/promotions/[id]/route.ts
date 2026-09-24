// app/api/admin/commercial/promotions/[id]/route.ts
// ADD-NEW — GET satu promosi (dengan addon yang merujuknya) dan PUT ubah. Tidak ada DELETE: promosi dinonaktifkan lewat PATCH /status
// (promosi yang masih dirujuk addon/pesanan tidak bisa dihapus, migration 0133). Perubahan promosi hanya memengaruhi pesanan BARU;
// pesanan lama membekukan promosi di commercial_snapshot (0131).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updatePromotionSchema } from "@/lib/validation/commercial-promotions";
import { derivePromotionState } from "@/lib/commercial/promotion-state";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("promotions").select("*").eq("id", ctx.params.id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Promosi tidak ditemukan atau Anda tidak punya akses.");
  }
  const { data: addons } = await supabase.from("addons").select("id, code, name, status").eq("promotion_id", ctx.params.id);
  return { data: { ...data, ...derivePromotionState(data), linked_addons: addons ?? [] } };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updatePromotionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .update({
      code: body.code,
      name: body.name,
      benefit_configuration: body.benefit,
      valid_from: body.valid_from ?? null,
      valid_to: body.valid_to ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode promosi ini sudah dipakai.");
    }
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Promosi aktif wajib punya benefit valid, dan masa berlaku harus berurutan.");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Promosi tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data: { ...data, ...derivePromotionState(data) } };
});
