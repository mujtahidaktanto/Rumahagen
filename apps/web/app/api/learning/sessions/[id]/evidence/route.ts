// app/api/learning/sessions/[id]/evidence/route.ts
// API-102 GET /learning/sessions/{id}/evidence — evidence dihubungkan lewat
// binding_id (bukan session_id langsung), jadi di-join ke
// session_provider_bindings untuk scoping per session. Otorisasi lewat RLS
// session_participation_evidence_select (0022).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_participation_evidence")
    .select("*, session_provider_bindings!inner(session_id)")
    .eq("session_provider_bindings.session_id", ctx.params.id)
    .order("received_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
