// app/api/commercial/entitlements/[id]/route.ts
// API-187 GET /commercial/entitlements/{entitlement_id} — Owner/admin.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commercial_entitlements")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Entitlement tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
