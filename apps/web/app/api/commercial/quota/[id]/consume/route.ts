// app/api/commercial/quota/[id]/consume/route.ts
// API-195 POST /commercial/quota/{quota_id}/consume — "Server-authorized
// domain operation": staf/service_role SAJA (BUKAN endpoint client bebas,
// beda dari consume_refresh_allowance() yang dipanggil Agent sendiri lewat
// refresh_listing() untuk capacity_type='listing_refresh'). Lewat RPC
// consume_quota_capacity() (SECURITY DEFINER, 0079).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { consumeQuotaSchema } from "@/lib/validation/commercial-quota";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, consumeQuotaSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("consume_quota_capacity", {
    p_pool_id: ctx.params.id,
    p_consuming_resource_type: body.consuming_resource_type,
    p_consuming_resource_reference: body.consuming_resource_reference,
    p_quantity: body.quantity,
    p_idempotency_key: body.idempotency_key ?? null,
  });

  if (error) {
    if (error.message?.includes("Server-authorized domain operation")) {
      throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk operasi ini.");
    }
    if (error.message?.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", "Quota pool tidak ditemukan.");
    }
    throw error;
  }

  return { data, status: 201 };
});
