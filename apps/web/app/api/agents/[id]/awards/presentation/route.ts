// app/api/agents/[id]/awards/presentation/route.ts
// API-236 GET /agents/{slug|user_id}/awards/presentation — title yang ditampilkan Agent di profil publik: 1 utama + maksimal 3 tambahan (berurutan), dibaca dari view
// `public_agent_profiles` (migration 0148). Parameter = public_slug atau user_id.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { agentLookup } from "@/lib/api/agent-key";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const key = agentLookup(ctx.params.id);
  const { data, error } = await supabase
    .from("public_agent_profiles")
    .select("primary_title, additional_titles")
    .eq(key.column, key.value)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Profil agent tidak ditemukan atau tidak publik.");
  }

  return { data: { primary: data.primary_title, additional: data.additional_titles ?? [] } };
});
