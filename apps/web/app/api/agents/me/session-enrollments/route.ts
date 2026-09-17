// app/api/agents/me/session-enrollments/route.ts
// API-093 GET /agents/me/session-enrollments — enrollment milik pemanggil
// sendiri. Scoped eksplisit `.eq("agent_id", ctx.userId)` — pola sama
// seperti agents/me/listings.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat enrollment milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_enrollments")
    .select("*")
    .eq("agent_id", ctx.userId)
    .order("requested_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
