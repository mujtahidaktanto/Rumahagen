// app/api/organizations/[id]/quota/route.ts
// API-192 GET /organizations/{organization_id}/quota — Organization-scoped
// authority. Keterbatasan evidenced yang sama dengan
// organizations/{id}/entitlements/route.ts — RLS operational_quota_pools_
// select (0019) hanya cek user_id, belum ada jalur organization-membership.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operational_quota_pools")
    .select("*, quota_capacities(*)")
    .eq("organization_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
