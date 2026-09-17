// app/api/learning/paths/[id]/versions/route.ts
// ADD-NEW — POST create version (RLS learning_path_versions_manage sudah
// lengkap sejak 0057). GET list versions untuk kebutuhan admin melihat
// riwayat versi.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createLearningPathVersionSchema } from "@/lib/validation/learning-paths";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_path_versions")
    .select("*")
    .eq("learning_path_id", ctx.params.id)
    .order("version_no", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createLearningPathVersionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_path_versions")
    .insert({ ...body, learning_path_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "version_no ini sudah ada untuk path tersebut.");
    }
    throw error;
  }

  return { data, status: 201 };
});
