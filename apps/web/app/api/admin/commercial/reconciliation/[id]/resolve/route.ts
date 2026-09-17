// app/api/admin/commercial/reconciliation/[id]/resolve/route.ts
// API-199 POST /admin/commercial/reconciliation/{case_id}/resolve —
// Authorized reconciliation operator. Lifecycle evidenced eksplisit di
// STEP11-B7 §13: OPEN -> INVESTIGATING -> RESOLVED dengan REJECTED/
// ESCALATED terkontrol (dikunci CHECK constraint di 0076). `resolved_at`
// hanya diisi kalau status baru = 'resolved' (status lain masih proses
// berjalan, belum final).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { resolveReconciliationCaseSchema } from "@/lib/validation/commercial-reconciliation";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, resolveReconciliationCaseSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reconciliation_cases")
    .update({
      status: body.status,
      resolution_metadata: body.resolution_metadata ?? null,
      resolved_at: body.status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Reconciliation case tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
