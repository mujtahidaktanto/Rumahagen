// app/api/listings/route.ts
// API-025 POST /listings, dan GET /listings (list dasar, bukan API-039
// properties/search yang punya infra geo-search terpisah). Sumber semantik:
// STEP11-B2_LISTING_SEARCH_LEAD_REFRESH_API_SYNCHRONIZATION.
//
// Otorisasi TIDAK dicek manual di sini — sepenuhnya diserahkan ke RLS
// `listings_insert`/`listings_select_published_or_owner_or_staff` di
// supabase/migrations/0018_m03_listings.sql (R-02: satu sumber keputusan akses).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createListingSchema, listListingsQuerySchema } from "@/lib/validation/listings";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`.slice(0, 220);
}

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat listing.");
  }

  const body = await validateJsonBody(ctx.request, createListingSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...body,
      agent_id: body.agent_id ?? ctx.userId,
      slug: body.slug ?? slugify(body.title),
    })
    .select()
    .single();

  if (error) {
    throwIntegrityError(error);
  }

  return { data, status: 201 };
});

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listListingsQuerySchema);

  const supabase = await createClient();
  // Urutan "district-local freshness" (Gate PRE-00-E §26): freshness_rank_at
  // (0116) adalah COALESCE(last_refreshed_at, published_at) GENERATED STORED --
  // Refresh (0020) menaikkan listing ke posisi seolah baru publish tanpa
  // mengubah published_at asli. `id` sebagai tie-break deterministik untuk
  // timestamp yang identik persis (Gate §26, "listing_id ASC is only a final
  // deterministic fallback").
  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .order("freshness_rank_at", { ascending: false })
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.transaction_type) query = query.eq("transaction_type", filters.transaction_type);
  if (filters.property_type) query = query.eq("property_type", filters.property_type);
  if (filters.province_id) query = query.eq("province_id", filters.province_id);
  if (filters.city_id) query = query.eq("city_id", filters.city_id);
  if (filters.district_id) query = query.eq("district_id", filters.district_id);
  if (filters.min_price !== undefined) query = query.gte("price", filters.min_price);
  if (filters.max_price !== undefined) query = query.lte("price", filters.max_price);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return {
    data,
    pagination: buildPaginationMeta(limit, offset, count ?? 0),
  };
});
