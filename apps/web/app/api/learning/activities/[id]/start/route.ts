// app/api/learning/activities/[id]/start/route.ts
// API-065 POST /learning/activities/{activity_id}/start — Start learner
// activity instance. TIDAK ADA tabel "activity instance" terpisah di skema
// (hanya learning_activity_completions) — direalisasikan sebagai baris
// completion dengan completion_status='in_progress', attempt_no berikutnya
// dihitung dari attempt sebelumnya milik user yang sama untuk activity yang
// sama (pola sama seperti quiz_attempts yang juga append-only per percobaan).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk memulai learning activity.");
  }

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("learning_activity_completions")
    .select("id", { count: "exact", head: true })
    .eq("learning_activity_id", ctx.params.id)
    .eq("user_id", ctx.userId);

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabase
    .from("learning_activity_completions")
    .insert({
      learning_activity_id: ctx.params.id,
      user_id: ctx.userId,
      completion_status: "in_progress",
      attempt_no: (count ?? 0) + 1,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
