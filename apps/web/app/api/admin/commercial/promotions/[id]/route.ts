// app/api/admin/commercial/promotions/[id]/route.ts
// ADD-NEW — GET satu promosi (dengan addon dan paket langganan yang merujuknya) dan PUT ubah. Tidak ada DELETE: promosi dinonaktifkan lewat PATCH /status
// (promosi yang masih dirujuk addon/pesanan tidak bisa dihapus, migration 0133). Perubahan promosi hanya memengaruhi pesanan BARU;
// pesanan lama membekukan promosi di commercial_snapshot (0131). Aturan kelayakan (0134) dievaluasi server pada pesanan baru; respons memuat
// redemption_count (pesanan pending + confirmed).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updatePromotionSchema } from "@/lib/validation/commercial-promotions";
import { derivePromotionState } from "@/lib/commercial/promotion-state";
import { getRedemptionCounts } from "@/lib/commercial/promotion-usage";
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
  const { data: plans } = await supabase.from("subscription_plans").select("id, code, name, status").eq("promotion_id", ctx.params.id);
  const counts = await getRedemptionCounts(supabase, [data.id]);
  return { data: { ...data, ...derivePromotionState(data), linked_addons: addons ?? [], linked_plans: plans ?? [], redemption_count: counts.get(data.id) ?? 0 } };
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
      // PUT = form penuh: eligibility yang tidak dikirim dikosongkan (promosi berlaku untuk semua pembeli).
      eligibility_configuration: body.eligibility ?? {},
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
      throw new ApiError("VALIDATION_ERROR", "Promosi aktif wajib punya benefit valid, aturan kelayakan harus berbentuk valid, dan masa berlaku harus berurutan.");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Promosi tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data: { ...data, ...derivePromotionState(data) } };
});
