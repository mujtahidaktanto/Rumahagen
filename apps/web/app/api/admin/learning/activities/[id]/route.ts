// app/api/admin/learning/activities/[id]/route.ts
// API-078 PUT /admin/learning/activities/{id} — Update Activity definition.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateLearningActivitySchema } from "@/lib/validation/learning-activities";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateLearningActivitySchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_activities")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning activity tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
