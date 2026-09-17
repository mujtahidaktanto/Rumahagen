// app/api/learning/paths/[id]/route.ts
// API-062 GET /learning/paths/{path_id} — path detail. PUT update ADD-NEW
// (pola sama seperti POST di route.ts induk).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateLearningPathSchema } from "@/lib/validation/learning-paths";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning path tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateLearningPathSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_paths")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning path tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
