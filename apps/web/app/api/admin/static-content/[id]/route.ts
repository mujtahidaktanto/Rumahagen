// app/api/admin/static-content/[id]/route.ts — GET/PUT satu halaman static_public_content. Tidak ada DELETE (siklus Draft→Diterbitkan→Tidak diterbitkan→Diarsipkan,
// migration 0037 komentar "Gate PRE-00-M §9" — pensiunkan halaman lewat status archived, bukan hapus permanen, pola sama seperti addons/promotions/subscription_plans).
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { staticContentSchema } from "@/lib/validation/static-content";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("static_public_content").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Halaman konten tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, staticContentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("static_public_content")
    .update({
      title: body.title,
      slug: body.slug,
      content: body.content ?? null,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      canonical_url: body.canonical_url ?? null,
      indexability: body.indexability ?? "index",
      sitemap_participation: body.sitemap_participation ?? true,
      ...(body.status ? { status: body.status } : {}),
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Alamat halaman (slug) ini sudah dipakai.");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Halaman konten tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
