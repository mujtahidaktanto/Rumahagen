// app/api/agents/[id]/route.ts
// API-014 GET /agents/{id} — Public agent profile (STEP11-B1). RLS
// agent_profiles_select yang menggerbangi (profile_visibility='public'
// publik, private hanya lewat m02.agent_profile.view own/all).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("user_id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Profil agent tidak ditemukan atau tidak publik.");
  }

  return { data };
});
