// app/api/ref-districts/route.ts
// GET /ref-districts — daftar kecamatan untuk dropdown alamat. Filter city_id dipakai klien agar pilihan hanya kecamatan milik kota/kabupaten yang
// dipilih (database juga menolak kombinasi tak berkaitan: migration 0152). Publik (RLS ref_districts_select_public).
// Parameter: city_id (uuid), q (cari nama), limit/offset. Desa/kelurahan: GET /ref-villages?district_id=.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { containsPattern, optionalUuidParam } from "@/lib/api/ref-query";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const cityId = optionalUuidParam(url.searchParams, "city_id");
  const q = containsPattern(url.searchParams);

  const supabase = await createClient();
  let query = supabase
    .from("ref_districts")
    .select("id, city_id, code, name", { count: "exact" })
    .order("code")
    .range(offset, offset + limit - 1);
  if (cityId) {
    query = query.eq("city_id", cityId);
  }
  if (q) {
    query = query.ilike("name", q);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }
  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
