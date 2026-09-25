// app/api/ref-provinces/route.ts
// GET /ref-provinces — daftar provinsi untuk dropdown alamat (langkah pertama rantai Provinsi > Kota/Kabupaten > Kecamatan > Desa/Kelurahan).
// Publik (RLS ref_provinces_select_public). Parameter: q (cari nama), limit/offset. Data diisi dari Kepmendagri 2025 (supabase/seed/wilayah).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { containsPattern } from "@/lib/api/ref-query";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const q = containsPattern(url.searchParams);

  const supabase = await createClient();
  let query = supabase
    .from("ref_provinces")
    .select("id, code, name", { count: "exact" })
    .order("code")
    .range(offset, offset + limit - 1);
  if (q) {
    query = query.ilike("name", q);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }
  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
