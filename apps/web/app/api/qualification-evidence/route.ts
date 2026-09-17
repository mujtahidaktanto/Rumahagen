// app/api/qualification-evidence/route.ts
// API-220 POST /qualification-evidence — create manual (Agent/system/
// partner/authorized issuer). Otorisasi lewat RLS
// qualification_evidence_insert (0026) — m15.qualification.administer.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createQualificationEvidenceSchema } from "@/lib/validation/qualification";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createQualificationEvidenceSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("qualification_evidence")
    .insert(body)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
