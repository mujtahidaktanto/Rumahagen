// app/api/admin/developer-projects/route.ts
// API-119 POST (create), API-120 GET (list) /admin/developer-projects. Nama
// route mengikuti kontrak evidenced STEP11-B3 apa adanya ("administrative
// Project creation/read") — TAPI RLS developer_projects_insert/select (0034)
// juga mengizinkan Developer Partner scope OWN, jadi endpoint ini bukan
// eksklusif staf; siapa pun yang lolos has_permission() bisa lewat sini
// (R-02, satu path, RLS yang membedakan wewenang).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createDeveloperProjectSchema } from "@/lib/validation/developer-projects";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`.slice(0, 220);
}

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createDeveloperProjectSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("developer_projects")
    .insert({ ...body, slug: slugify(body.name) })
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
    .from("developer_projects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
