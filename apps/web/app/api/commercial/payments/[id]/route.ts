// app/api/commercial/payments/[id]/route.ts
// API-184 GET /commercial/payments/{payment_id} — Payment owner/admin. RLS
// payment_transactions_select (0073, join ke commercial_orders) yang
// menggerbangi. TIDAK ADA PUT/PATCH — payment_state hanya berubah lewat
// webhook Midtrans terverifikasi (staf-only UPDATE di RLS, 0073).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Payment tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
