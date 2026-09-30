// app/api/admin/home-hero-banners/route.ts
// GET list (semua, termasuk nonaktif, urut display_order) / POST slide baru banner hero halaman utama (migration 0167, home_hero_banners).
// Otorisasi lewat RLS home_hero_banners_manage (has_permission m11.static_public_content.publish).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { heroBannerSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("home_hero_banners")
    .select("*", { count: "exact" })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat slide banner.");
  }

  const body = await validateJsonBody(ctx.request, heroBannerSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_hero_banners")
    .insert({ ...body, created_by: ctx.userId, updated_by: ctx.userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
