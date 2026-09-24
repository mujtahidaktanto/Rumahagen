// app/api/commercial/plans/route.ts
// GET /commercial/plans — katalog paket langganan Pro (M14, subscription_plans 0142). RLS subscription_plans_select: paket berstatus active terlihat semua
// pengguna, staf melihat semua. Harga per cakupan: price_personal (langganan pribadi) dan price_organization (langganan organisasi; hanya leader yang bisa
// membeli). Membeli lewat POST /commercial/orders { subscription_plan_id, organization_id?, promotion_id? }; beli lagi = pembelian baru (tidak ada perpanjangan).
// Promosi (0143): paket berpromosi diberi promotion_offer untuk pengguna login (berlaku/tidak, alasan, harga akhir) menurut cakupan yang diminta:
// tanpa ?organization_id = pribadi, dengan ?organization_id=... = organisasi tersebut (leader).

import { withApiHandler } from "@/lib/api/handler";
import { validateSearchParams } from "@/lib/api/validate";
import { annotatePlansWithPromotionOffers } from "@/lib/commercial/promotion-offers";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const plansQuerySchema = z.object({ organization_id: z.string().uuid().optional() });

export const GET = withApiHandler({}, async (ctx) => {
  const filters = validateSearchParams(new URL(ctx.request.url).searchParams, plansQuerySchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, code, name, description, duration_months, price_personal, price_organization, currency, status, promotion_id")
    .order("duration_months", { ascending: true });
  if (error) {
    throw error;
  }
  const annotated = await annotatePlansWithPromotionOffers(supabase, ctx.userId, data ?? [], filters.organization_id ?? null);
  return { data: annotated, offer_scope: filters.organization_id ? "organization" : "personal" };
});
