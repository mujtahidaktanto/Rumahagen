// app/api/commercial/plans/route.ts
// GET /commercial/plans — katalog paket langganan Pro (M14, subscription_plans 0142). RLS subscription_plans_select: paket berstatus active terlihat semua
// pengguna, staf melihat semua. Harga per cakupan: price_personal (langganan pribadi) dan price_organization (langganan organisasi; hanya leader yang bisa
// membeli). Membeli lewat POST /commercial/orders { subscription_plan_id, organization_id? }; beli lagi = pembelian baru (tidak ada perpanjangan).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, code, name, description, duration_months, price_personal, price_organization, currency, status")
    .order("duration_months", { ascending: true });
  if (error) {
    throw error;
  }
  return { data };
});
