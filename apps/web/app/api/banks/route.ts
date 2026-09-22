// app/api/banks/route.ts
// GET/POST /banks (M07 Bank Master, migration 0089) -- RLS banks_select
// (has_permission('m07.bank_master.view'), Manager/Admin/Agent) dan
// banks_manage (has_permission('m07.bank_master.configure'), Admin+
// Superadmin) SUDAH ADA sejak 0089, tapi belum ada route yang
// memakainya -- Bank Master hanya bisa diisi lewat SQL langsung sampai
// sekarang. Tidak ada permission baru di sini.
//
// GET tidak difilter status (beda dari GET /calculator/dbr/config yang
// SENGAJA hanya menampilkan bank 'active' untuk dipilih agent) -- route
// ini untuk pengelolaan, staf perlu melihat bank 'inactive' juga.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createBankSchema } from "@/lib/validation/banks";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("banks")
    .select("*", { count: "exact" })
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createBankSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banks")
    .insert({ ...body, updated_by: ctx.userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
