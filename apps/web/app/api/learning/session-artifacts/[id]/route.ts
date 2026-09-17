// app/api/learning/session-artifacts/[id]/route.ts
// API-112 DELETE /learning/session-artifacts/{artifact_id}. Otorisasi lewat
// RLS session_artifacts_manage (FOR ALL, has_permission m04.artifact.manage,
// 0022) — mencakup DELETE, tidak ada gap.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_artifacts")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Artifact tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
