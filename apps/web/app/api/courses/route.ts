// app/api/courses/route.ts
// API-051 GET /courses (katalog, publik untuk status=published), API-057
// POST /admin/courses (create — literal path admin/courses TAPI
// digabung di sini karena resource+RLS-nya sama persis `courses`, pola
// sama seperti listings/events yang juga satu route file untuk publik+
// create). Otorisasi lewat RLS courses_select/courses_manage (0056).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createCourseSchema, listCoursesQuerySchema } from "@/lib/validation/courses";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat course.");
  }

  const body = await validateJsonBody(ctx.request, createCourseSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .insert({ ...body, created_by: body.created_by ?? ctx.userId })
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
  const filters = validateSearchParams(url.searchParams, listCoursesQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  // owner=me: kursus milik sendiri (mis. layar "Kursus Saya"); antrean tinjauan staf memakai status=pending_review (RLS courses_select: staf melihat semua status).
  if (filters.owner === "me") {
    if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
    query = query.eq("created_by", ctx.userId);
  }
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ");
    query = query.ilike("title", `%${term}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
