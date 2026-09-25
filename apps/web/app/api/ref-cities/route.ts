// app/api/ref-cities/route.ts
// GET /ref-cities — daftar kota/kabupaten untuk dropdown alamat. Filter province_id dipakai klien agar pilihan hanya kota/kabupaten milik provinsi
// yang dipilih (database juga menolak kombinasi tak berkaitan: migration 0152). Publik (RLS ref_cities_select_public).
// Parameter: province_id (uuid), q (cari nama), limit/offset. type = kota | kabupaten; nama sudah memuat awalan resmi (Kota Bandung, Kabupaten Bandung).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { containsPattern, optionalUuidParam } from "@/lib/api/ref-query";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const provinceId = optionalUuidParam(url.searchParams, "province_id");
  const q = containsPattern(url.searchParams);

  const supabase = await createClient();
  let query = supabase
    .from("ref_cities")
    .select("id, province_id, code, name, type", { count: "exact" })
    .order("code")
    .range(offset, offset + limit - 1);
  if (provinceId) {
    query = query.eq("province_id", provinceId);
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
