// app/api/admin/commercial/promotions/route.ts
// ADD-NEW — GET daftar promosi (hanya baca, untuk memilih promosi pada form addon). Pembuatan/pengubahan promosi belum dibangun.
// RLS promotions_manage (staf configure) yang menggerbangi; bukan staf mendapat daftar kosong.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("promotions")
    .select("id, code, name, status, valid_from, valid_to, benefit_configuration", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    throw error;
  }
  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
