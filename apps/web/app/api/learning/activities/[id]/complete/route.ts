// app/api/learning/activities/[id]/complete/route.ts
// API-066 POST /learning/activities/{activity_id}/complete — "Completion
// claim; server validates evidence/state" — "PRESERVE + AUTHORITY
// HARD-GATE". Q-M04-LC-02A/02B: completion adalah INPUT/KLAIM milik learner
// sendiri, BUKAN outcome otoritatif langsung — tidak ada trigger validasi
// tambahan di sini karena STEP11-B4 TIDAK mengevidence aturan validasi eksak
// apa pun (beda dari session_completion_outcomes/M04 Session yang punya
// aturan tertulis "harus enrollment active" dari Gate §33). reward_lp TIDAK
// otomatis di-grant dari sini — tetap harus lewat adjust_learning_points()
// terpisah (lihat catatan learning_activities/0058), mencegah 2 jalur
// reward LP yang tidak konsisten.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { completeActivitySchema } from "@/lib/validation/learning-activities";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk klaim completion.");
  }

  const body = await validateJsonBody(ctx.request, completeActivitySchema);
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
      completion_status: body.completion_status,
      outcome: body.outcome,
      evidence_reference: body.evidence_reference,
      attempt_no: (count ?? 0) + 1,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
