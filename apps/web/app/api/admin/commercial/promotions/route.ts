// app/api/admin/commercial/promotions/route.ts
// ADD-NEW — GET daftar promosi (filter status/q) dan POST buat promosi. Otorisasi lewat RLS promotions_manage
// (m14.commercial_administration.configure: Superadmin/Admin); bukan staf mendapat daftar kosong dan ditolak saat menulis.
// Aturan bentuk promosi ditegakkan juga oleh CHECK migration 0133/0134. Respons memuat effective_status/is_applicable/benefit_label,
// eligibility_configuration, redemption_count (pesanan pending + confirmed yang membawa promosi), serta linked_addon_count dan linked_plan_count (add-on / paket langganan yang memakai promosi).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createPromotionSchema, listPromotionsQuerySchema } from "@/lib/validation/commercial-promotions";
import { derivePromotionState } from "@/lib/commercial/promotion-state";
import { getLinkedCounts, getRedemptionCounts } from "@/lib/commercial/promotion-usage";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listPromotionsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("promotions")
    .select("id, code, name, status, valid_from, valid_to, benefit_configuration, eligibility_configuration, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }
  const now = new Date();
  const ids = (data ?? []).map((row) => row.id);
  const counts = await getRedemptionCounts(supabase, ids);
  const linked = await getLinkedCounts(supabase, ids);
  const rows = (data ?? []).map((row) => ({
    ...row,
    ...derivePromotionState(row, now),
    redemption_count: counts.get(row.id) ?? 0,
    linked_addon_count: linked.get(row.id)?.addons ?? 0,
    linked_plan_count: linked.get(row.id)?.plans ?? 0,
  }));
  return { data: rows, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const body = await validateJsonBody(ctx.request, createPromotionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .insert({
      code: body.code,
      name: body.name,
      status: body.status ?? "draft",
      benefit_configuration: body.benefit,
      rule_configuration: {},
      eligibility_configuration: body.eligibility ?? {},
      valid_from: body.valid_from ?? null,
      valid_to: body.valid_to ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode promosi ini sudah dipakai.");
    }
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Promosi aktif wajib punya benefit valid, aturan kelayakan harus berbentuk valid, dan masa berlaku harus berurutan.");
    }
    throw error;
  }
  return { data: { ...data, ...derivePromotionState(data) }, status: 201 };
});
