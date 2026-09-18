// app/api/agents/me/organization-invitations/route.ts
// API-165 GET /agents/me/organization-invitations — own invitations/requests
// (STEP11-B6). Milik sendiri = agent_id ATAU leader_id sama dengan diri
// sendiri (RLS organization_invitations_select juga mengizinkan keduanya).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("organization_invitations")
    .select("*", { count: "exact" })
    .or(`agent_id.eq.${ctx.userId},leader_id.eq.${ctx.userId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
