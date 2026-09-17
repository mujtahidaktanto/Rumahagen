// app/api/admin/learning-point-adjustments/route.ts
// API-073 POST /admin/learning-point-adjustments — koreksi manual LP oleh
// staf. Bungkus adjust_learning_points() dari 0046 (menutup gap: permission
// m04.learning_point.adjust ada di seed 0023 tapi tidak ada RLS INSERT untuk
// learning_point_transactions sejak awal). Otorisasi dicek DI DALAM fungsi
// (Superadmin/Admin/Manager — Gate PRE-00-F §13: "No Agent self-adjustment"),
// bukan diduplikasi di sini (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { learningPointAdjustmentSchema } from "@/lib/validation/learning-points";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, learningPointAdjustmentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("adjust_learning_points", {
      p_user_id: body.user_id,
      p_amount: body.amount,
      p_reason: body.reason ?? null,
    })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("m04.learning_point.adjust")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
