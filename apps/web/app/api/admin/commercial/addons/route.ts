// app/api/admin/commercial/addons/route.ts
// ADD-NEW — GET daftar katalog add-on (semua status untuk staf) dan POST buat addon. Otorisasi lewat RLS addons_manage/addons_select
// (m14.commercial_administration.configure: Superadmin/Admin). Non-staf hanya melihat addon aktif (data publik) dan ditolak saat menulis.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createAddonSchema, listAddonsQuerySchema } from "@/lib/validation/commercial-addons";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listAddonsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("addons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }
  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const body = await validateJsonBody(ctx.request, createAddonSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addons")
    .insert({ ...body, status: body.status ?? "draft" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode addon ini sudah dipakai.");
    }
    throw error;
  }
  return { data, status: 201 };
});
