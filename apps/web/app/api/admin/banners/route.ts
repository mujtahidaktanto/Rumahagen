// app/api/admin/banners/route.ts
// API-136 POST /admin/banners (M09 mutation atas public_announcement_promotion).
// GET list (semua status, termasuk draft) — pelengkap wajar untuk console
// admin, tidak ada API ID terpisah di STEP11-A tapi dibutuhkan supaya staf
// bisa melihat draft/scheduled sebelum di-publish. Otorisasi lewat RLS
// public_announcement_promotion_manage_m11 (has_permission
// m11.announcement_promotion.publish) — koreksi 0028, BUKAN
// m09.public_announcement_promotion.manage (deprecated sejak 0028).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { bannerSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("public_announcement_promotion")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat banner/announcement.");
  }

  const body = await validateJsonBody(ctx.request, bannerSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .insert({ ...body, created_by: ctx.userId, updated_by: ctx.userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
