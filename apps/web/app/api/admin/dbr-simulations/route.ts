// app/api/admin/dbr-simulations/route.ts
// GET /admin/dbr-simulations (STEP11-B10 M07 list, PRESERVE). Otorisasi
// sama dengan GET /dbr-simulations (has_permission('m07.dbr.domain_
// operations', agent_id), Superadmin/Admin/Manager=ALL) -- RLS 'all' scope
// sudah membuat GET /dbr-simulations mengembalikan SEMUA baris untuk staf,
// tapi Core mengunci ini sebagai route ADMIN terpisah, jadi dibuat di sini
// dengan tambahan filter `agent_id` (untuk staf menelusuri simulasi milik
// agent tertentu) yang tidak ada di route self-service.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const agentId = url.searchParams.get("agent_id");

  const supabase = await createClient();
  let query = supabase
    .from("dbr_simulations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (agentId) query = query.eq("agent_id", agentId);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
