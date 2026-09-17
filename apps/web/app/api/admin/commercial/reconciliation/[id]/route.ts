// app/api/admin/commercial/reconciliation/[id]/route.ts
// API-198 GET /admin/commercial/reconciliation/{case_id} — Authorized
// reconciliation operator.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reconciliation_cases")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Reconciliation case tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
