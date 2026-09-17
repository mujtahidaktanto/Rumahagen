// app/api/learning/sessions/route.ts
// API-086 GET /learning/sessions (list), API-088 POST /learning/sessions
// (create). Otorisasi sepenuhnya lewat RLS learning_sessions_select/_insert
// (0021) — R-02.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createLearningSessionSchema, listLearningSessionsQuerySchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat learning session.");
  }

  const body = await validateJsonBody(ctx.request, createLearningSessionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_sessions")
    .insert({ ...body, owner_id: body.owner_id ?? ctx.userId })
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
  const filters = validateSearchParams(url.searchParams, listLearningSessionsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("learning_sessions")
    .select("*", { count: "exact" })
    .order("start_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.session_type) query = query.eq("session_type", filters.session_type);
  if (filters.organization_id) query = query.eq("organization_id", filters.organization_id);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
