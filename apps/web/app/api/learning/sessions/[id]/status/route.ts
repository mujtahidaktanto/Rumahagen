// app/api/learning/sessions/[id]/status/route.ts
// API-090 PATCH /learning/sessions/{id}/status — transisi lifecycle. Tidak
// ada trigger pemisah permission publish (beda dari listings/events/
// developer_projects) — RLS learning_sessions_update (has_permission
// m04.learning_session.update, owner_id) yang sama menggerbangi semua
// perubahan field termasuk status, sesuai desain 0021 apa adanya.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { sessionStatusSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, sessionStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_sessions")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning session tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
