// app/api/agents/me/claims/route.ts
// GET daftar klaim milik pemanggil sendiri. Scoped eksplisit
// `.eq("agent_id", ctx.userId)` — pola sama seperti agents/me/listings.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat klaim milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_project_claims")
    .select("*")
    .eq("agent_id", ctx.userId)
    .order("claimed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
