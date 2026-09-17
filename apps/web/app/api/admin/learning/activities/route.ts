// app/api/admin/learning/activities/route.ts
// API-076 GET /admin/learning/activities (manage Activity definitions),
// API-077 POST /admin/learning/activities (create). Otorisasi lewat RLS
// learning_activities_select/_manage (0058) — m04.learning_activity.manage.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createLearningActivitySchema } from "@/lib/validation/learning-activities";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createLearningActivitySchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_activities")
    .insert(body)
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
    .from("learning_activities")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
