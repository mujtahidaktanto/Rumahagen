// app/api/learning/session-enrollments/[id]/evidence/route.ts
// API-103 GET /learning/session-enrollments/{id}/evidence — evidence yang
// terikat ke satu enrollment. Otorisasi lewat RLS
// session_participation_evidence_select (0022, has_permission
// m04.session_evidence.view lewat enrollment.agent_id).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_participation_evidence")
    .select("*")
    .eq("session_enrollment_id", ctx.params.id)
    .order("received_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
