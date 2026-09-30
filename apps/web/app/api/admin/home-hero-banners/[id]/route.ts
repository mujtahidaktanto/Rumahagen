// app/api/admin/home-hero-banners/[id]/route.ts
// GET/PUT/DELETE satu slide banner hero halaman utama (migration 0167). Otorisasi lewat RLS home_hero_banners_manage (0167). PUT/DELETE menghapus gambar lama
// dari storage saat diganti/dilepas atau slide dihapus (pola sama seperti app/api/admin/banners/[id]/route.ts).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateHeroBannerSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { removeHomeHeroMediaByUrl } from "@/lib/storage/home-hero-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("home_hero_banners").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Slide banner tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateHeroBannerSchema);
  const supabase = await createClient();

  const { data: before } = await supabase.from("home_hero_banners").select("image_reference").eq("id", ctx.params.id).maybeSingle<{ image_reference: string | null }>();

  const { data, error } = await supabase
    .from("home_hero_banners")
    .update({ ...body, updated_by: ctx.userId })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Slide banner tidak ditemukan atau Anda tidak punya akses.");
  }

  if (before && "image_reference" in body && before.image_reference && before.image_reference !== data.image_reference) {
    await removeHomeHeroMediaByUrl(before.image_reference);
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_hero_banners")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle<{ image_reference: string | null }>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Slide banner tidak ditemukan atau Anda tidak punya akses.");
  }

  await removeHomeHeroMediaByUrl(data.image_reference);

  return { data: { id: ctx.params.id, deleted: true } };
});
