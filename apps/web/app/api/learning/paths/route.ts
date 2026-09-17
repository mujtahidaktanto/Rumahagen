// app/api/learning/paths/route.ts
// API-061 GET /learning/paths — Learning Path discovery (publik untuk
// status=published). POST create ADD-NEW (Q-M04-C-05A CONTROLLED API GAP
// di STEP11-B4 — RLS-nya sudah lengkap sejak 0057, route-nya belum ada
// sampai batch ini).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createLearningPathSchema } from "@/lib/validation/learning-paths";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createLearningPathSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_paths")
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
    .from("learning_paths")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
