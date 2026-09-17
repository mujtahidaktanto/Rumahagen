// app/api/developer-projects/route.ts
// API-116 GET /developer-projects — public/scoped Project discovery. Otorisasi
// sepenuhnya lewat RLS developer_projects_select (0034) — publik hanya lihat
// project dengan status active/coming_soon/sold_out DARI developer partner
// yang statusnya active; staf/developer pemilik lihat lebih luas lewat OR
// clause di policy yang sama (R-02, tidak diduplikasi di sini).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { listDeveloperProjectsQuerySchema } from "@/lib/validation/developer-projects";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listDeveloperProjectsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("developer_projects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.transaction_type) query = query.eq("transaction_type", filters.transaction_type);
  if (filters.province_id) query = query.eq("province_id", filters.province_id);
  if (filters.city_id) query = query.eq("city_id", filters.city_id);
  if (filters.district_id) query = query.eq("district_id", filters.district_id);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
