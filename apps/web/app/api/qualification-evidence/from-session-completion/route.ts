// app/api/qualification-evidence/from-session-completion/route.ts
// ADD-NEW — realisasi HTTP dari fungsi
// capture_qualification_evidence_from_session() (migration 0027, separuh
// pertama pipeline D13-03: M04 session_completion_outcomes -> M15
// qualification_evidence). Fungsi ini fisik sejak Tahap 6 tapi belum pernah
// punya route HTTP di batch M04 Session/Evidence — dipasang di sini karena
// secara REST resource-nya adalah qualification_evidence (M15), bukan
// learning session (M04).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { captureEvidenceFromCompletionSchema } from "@/lib/validation/qualification";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, captureEvidenceFromCompletionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("capture_qualification_evidence_from_session", {
      p_completion_outcome_id: body.completion_outcome_id,
    })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("m15.qualification.evaluate")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    if (typeof error.message === "string" && error.message.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
