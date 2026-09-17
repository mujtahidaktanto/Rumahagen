// app/api/qualification-evaluations/[id]/evidence/route.ts
// API-222 GET /qualification-evaluations/{evaluation_id}/evidence — daftar
// evidence yang tertaut ke satu evaluation (qualification_evidence.
// qualification_evaluation_id). Otorisasi lewat RLS
// qualification_evidence_select (0026) — m15.qualification.administer.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qualification_evidence")
    .select("*")
    .eq("qualification_evaluation_id", ctx.params.id)
    .order("captured_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
