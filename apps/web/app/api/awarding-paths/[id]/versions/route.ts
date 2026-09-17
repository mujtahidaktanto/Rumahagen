// app/api/awarding-paths/[id]/versions/route.ts
// API-210 GET /awarding-paths/{path_id}/versions (authorized/scoped),
// API-211 POST /awarding-paths/{path_id}/versions (authorized authority).
// Otorisasi lewat RLS awarding_path_versions_manage (0064). TIDAK ADA PUT
// atau PATCH status untuk versi (F11-B8-002: "no exact version-status
// transition endpoint... do not invent") — versi bersifat immutable setelah
// dibuat lewat REST, pola sama seperti learning_path_versions/0057.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAwardingPathVersionSchema } from "@/lib/validation/awarding-paths";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awarding_path_versions")
    .select("*")
    .eq("awarding_path_id", ctx.params.id)
    .order("version_no", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAwardingPathVersionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_path_versions")
    .insert({ ...body, awarding_path_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Version_no ini sudah dipakai untuk awarding path yang sama.");
    }
    throw error;
  }

  return { data, status: 201 };
});
