// app/api/agents/me/ai-connections/route.ts
// GET /agents/me/ai-connections (evidenced, STEP11-B10 §4 M13). Scoped
// eksplisit ke pemanggil sendiri (pola sama seperti agents/me/listings) —
// `encrypted_api_key` TIDAK diikutkan di SELECT sama sekali, konsisten
// dengan prinsip "tidak pernah keluar mentah" di komentar 0016.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat koneksi AI milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_ai_connections")
    .select("id, user_id, provider_id, status, disabled_by_admin, last_validated_at, connected_at, created_at, updated_at")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
