// app/api/commercial/quota/[id]/allocate/route.ts
// API-194 POST /commercial/quota/{quota_id}/allocate — Authorized
// organization/admin scope. Lewat RPC allocate_quota_capacity() (SECURITY
// DEFINER, 0079) — quota_allocations sengaja tanpa INSERT policy langsung
// (0019).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { allocateQuotaSchema } from "@/lib/validation/commercial-quota";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, allocateQuotaSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("allocate_quota_capacity", {
    p_pool_id: ctx.params.id,
    p_beneficiary_user_id: body.beneficiary_user_id ?? null,
    p_beneficiary_organization_id: body.beneficiary_organization_id ?? null,
    p_quantity: body.quantity,
  });

  if (error) {
    if (error.message?.includes("butuh permission")) {
      throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk operasi ini.");
    }
    if (error.message?.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", "Quota pool tidak ditemukan.");
    }
    throw error;
  }

  return { data, status: 201 };
});
