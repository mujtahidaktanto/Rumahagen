// app/api/organizations/search/route.ts
// GET /organizations/search — API-159 (M12, STEP11-B6 §8). Publik (tanpa
// sesi) -- "Organization discovery" perlu ditemukan sebelum seseorang
// jadi member (mis. untuk join-request). RLS organizations_select_active_
// public (0110) menggerbangi baris (status='active' saja -- closing/
// closed/suspended tersembunyi dari pencarian), kolom yang dikembalikan
// SENGAJA dikurasi ke field publik-aman saja (bukan SELECT * -- "must not
// expose private Organization information", B6 §8).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { searchOrganizationsQuerySchema } from "@/lib/validation/organizations";
import { createClient } from "@/lib/supabase/server";

const PUBLIC_COLUMNS = "id, organization_name, slug, organization_type, logo_url, description, created_at";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const query = validateSearchParams(url.searchParams, searchOrganizationsQuerySchema);

  const supabase = await createClient();
  let q = supabase
    .from("organizations")
    .select(PUBLIC_COLUMNS, { count: "exact" })
    .eq("status", "active")
    .order("organization_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (query.q) q = q.ilike("organization_name", `%${query.q}%`);
  if (query.organization_type) q = q.eq("organization_type", query.organization_type);

  const { data, count, error } = await q;
  if (error) throw error;

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
