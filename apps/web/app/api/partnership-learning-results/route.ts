// app/api/partnership-learning-results/route.ts
// ADD-NEW — tidak ada di STEP11-B4 (di luar cakupan M04 v1.2 QIR package
// yang disinkronkan B4; sumber Gate PRE-00-F §51, lihat 0024). GET (list),
// POST (create, Developer Partner scope OWN). Otorisasi lewat RLS
// partnership_learning_results_select/_insert (0024) — R-02.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createPartnershipLearningResultSchema } from "@/lib/validation/partnership-learning-results";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat partnership learning result.");
  }

  const body = await validateJsonBody(ctx.request, createPartnershipLearningResultSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partnership_learning_results")
    .insert({ ...body, partner_user_id: body.partner_user_id ?? ctx.userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("partnership_learning_results")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
