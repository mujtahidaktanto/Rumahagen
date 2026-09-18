// app/api/ref-villages/route.ts
// ADD-NEW — katalog referensi desa/kelurahan (M03 Fase 1, migration 0048).
// Tidak ada literal endpoint STEP11 (ref_provinces/cities/districts yang
// lebih lama pun belum punya REST API — gap pre-existing, dicatat di
// README, bukan ditutup diam-diam di batch ini). Dibangun karena RLS
// ref_villages_select_public FOR SELECT USING (true) sudah didesain
// publik sejak migration — form alamat listing butuh ini untuk berfungsi.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createRefVillageSchema } from "@/lib/validation/ref-villages";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const districtId = url.searchParams.get("district_id");

  const supabase = await createClient();
  let query = supabase
    .from("ref_villages")
    .select("*", { count: "exact" })
    .order("name")
    .range(offset, offset + limit - 1);

  if (districtId) {
    query = query.eq("district_id", districtId);
  }

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createRefVillageSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("ref_villages").insert(body).select().single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
