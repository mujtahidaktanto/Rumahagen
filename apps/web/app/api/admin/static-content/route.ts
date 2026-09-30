// app/api/admin/static-content/route.ts
// GET/POST static_public_content (M11 Konten Publik, migration 0037) — sebelumnya tidak ada satu pun route yang membaca/menulis tabel ini (celah dicatat
// audit/FRONTEND_GAPS.md). GET mengembalikan SEMUA status (draft dst.) — RLS static_public_content_select membatasi baris non-published hanya untuk
// pemegang m11.static_public_content.publish (Superadmin/Admin), jadi staf lain otomatis hanya melihat published. POST selalu membuat baris berstatus
// draft (skema tidak menerima status saat create) — publikasi lewat PUT terpisah.
import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { staticContentSchema } from "@/lib/validation/static-content";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("static_public_content")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat halaman konten.");
  }

  const body = await validateJsonBody(ctx.request, staticContentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("static_public_content")
    .insert({
      title: body.title,
      slug: body.slug,
      content: body.content ?? null,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      canonical_url: body.canonical_url ?? null,
      indexability: body.indexability ?? "index",
      sitemap_participation: body.sitemap_participation ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Alamat halaman (slug) ini sudah dipakai.");
    }
    throw error;
  }

  return { data, status: 201 };
});
