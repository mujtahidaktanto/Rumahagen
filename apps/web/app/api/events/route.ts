// app/api/events/route.ts
// API-079 GET /events (list), API-082 POST /events (create). Otorisasi
// sepenuhnya lewat RLS events_select/events_insert (0031) — R-02, tidak
// diduplikasi di sini.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createEventSchema, listEventsQuerySchema } from "@/lib/validation/events";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat event.");
  }

  const body = await validateJsonBody(ctx.request, createEventSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({ ...body, submitted_by: body.submitted_by ?? ctx.userId })
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
  const filters = validateSearchParams(url.searchParams, listEventsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("start_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.is_online !== undefined) query = query.eq("is_online", filters.is_online);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
