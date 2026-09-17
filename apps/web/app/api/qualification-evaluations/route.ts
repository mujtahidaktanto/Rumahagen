// app/api/qualification-evaluations/route.ts
// API-216 POST /qualification-evaluations — create manual (staf
// administer/evaluate langsung input hasil, terpisah dari pipeline
// otomatis evaluate_qualification() di
// qualification-evidence/{id}/evaluate). Otorisasi lewat RLS
// qualification_evaluations_insert (0026) — m15.qualification.evaluate.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createQualificationEvaluationSchema } from "@/lib/validation/qualification";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createQualificationEvaluationSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("qualification_evaluations")
    .insert(body)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
