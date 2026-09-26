// app/api/organizations/[id]/invitable-agents/route.ts
// GET /organizations/{id}/invitable-agents?q= — leader mencari Agent untuk diundang (nama atau nomor lisensi, minimal 2 huruf). Hanya profil publik, bukan anggota aktif, tanpa undangan pending dari
// organisasi ini (RPC search_invitable_agents, migration 0161).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const q = (new URL(ctx.request.url).searchParams.get("q") ?? "").slice(0, 60);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_invitable_agents", { p_organization_id: ctx.params.id, p_q: q });
  if (error) {
    if (error.code === "42501") throw new ApiError("FORBIDDEN", "Hanya leader organisasi yang bisa mencari Agent untuk diundang.");
    throw error;
  }
  return { data: data ?? [] };
});
