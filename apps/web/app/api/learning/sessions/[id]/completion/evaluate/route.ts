// app/api/learning/sessions/[id]/completion/evaluate/route.ts
// API-108 POST .../completion/evaluate. Otorisasi lewat RLS
// session_completion_outcomes_manage (has_permission m04.completion.manage,
// 0022). Trigger trg_completion_requires_active_enrollment (0022) menegakkan
// enrollment harus berstatus active/completed dulu — tidak diduplikasi di sini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { completionEvaluateSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, completionEvaluateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("session_completion_outcomes").insert(body).select().single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("belum berstatus active/completed")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
