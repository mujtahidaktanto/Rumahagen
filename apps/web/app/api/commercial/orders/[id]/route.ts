// app/api/commercial/orders/[id]/route.ts
// API-179 GET /commercial/orders/{order_id} — Order owner/admin. RLS
// commercial_orders_select (0072) yang menggerbangi. TIDAK ADA PUT/PATCH —
// status hanya berubah lewat checkout->webhook->fulfillment atau cancel().

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commercial_orders")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Order tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
