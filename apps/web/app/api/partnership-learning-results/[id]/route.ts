// app/api/partnership-learning-results/[id]/route.ts
// GET satu result, PUT update (biasa atau validation_status — trigger 0024
// menegakkan hanya Superadmin yang bisa ubah validation_status).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updatePartnershipLearningResultSchema } from "@/lib/validation/partnership-learning-results";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partnership_learning_results")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Partnership learning result tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updatePartnershipLearningResultSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partnership_learning_results")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("hanya Superadmin yang boleh mengubah validation_status")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Partnership learning result tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
