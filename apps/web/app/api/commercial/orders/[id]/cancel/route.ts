// app/api/commercial/orders/[id]/cancel/route.ts
// API-182 POST /commercial/orders/{order_id}/cancel — Order owner / staf.
// Lewat RPC cancel_commercial_order() (SECURITY DEFINER, 0079) — commercial_
// orders TIDAK PUNYA UPDATE RLS untuk pemilik sama sekali (0072), jadi tidak
// bisa lewat .update() biasa.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_commercial_order", {
    p_order_id: ctx.params.id,
  });

  if (error) {
    if (error.message?.includes("tidak ditemukan") || error.message?.includes("tidak punya akses")) {
      throw new ApiError("NOT_FOUND", "Order tidak ditemukan atau Anda tidak punya akses.");
    }
    if (error.message?.includes("hanya order berstatus pending")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }

  return { data };
});
