// app/api/developer-partners/me/claims/route.ts
// GET /developer-partners/me/claims — semua klaim masuk lintas proyek milik perusahaan pengguna login (migration 0147, partner_incoming_claims).
// Query: status, project_id, limit, offset; staf boleh menambah partner_id. Baris memuat nama Agent dan slug profil publik (hanya bila profil public);
// tidak ada kontak atau dokumen privat. Otorisasi di dalam fungsi database (bukan RLS langsung).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "revoked", "withdrawn"]).optional(),
  project_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
});

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, querySchema);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("partner_incoming_claims", {
    p_status: filters.status ?? null,
    p_project_id: filters.project_id ?? null,
    p_partner_id: filters.partner_id ?? null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    throw error;
  }
  const rows = (data ?? []) as { total_count: number | string }[];
  const first = rows[0];
  const total = first ? Number(first.total_count) : 0;
  return { data: rows.map(({ total_count: _t, ...row }) => row), pagination: buildPaginationMeta(limit, offset, total) };
});
