// app/api/awards/route.ts
// API-223 GET /awards (list, scoped: award aktif publik + m15.award.manage
// lihat semua), API-227 POST /awards (server/authorized awarding authority
// only). Otorisasi lewat RLS award_instances_select/_insert (0026) — R-02.
// INSERT juga digerbangi trigger trg_award_requires_authority_scope: award
// TIDAK BISA dibuat kalau title_definition_id belum punya
// title_authority_scopes aktif (master matrix M15: "Requires applicable
// Authority/Scope Binding; no Issuer Role").

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createAwardSchema } from "@/lib/validation/awards";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAwardSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("award_instances")
    .insert(body)
    .select()
    .single();

  if (error) {
    if (
      typeof error.message === "string" &&
      error.message.includes("tidak punya title_authority_scopes aktif")
    ) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("award_instances")
    .select("*", { count: "exact" })
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
