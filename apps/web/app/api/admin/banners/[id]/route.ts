// app/api/admin/banners/[id]/route.ts
// GET/PUT/DELETE satu banner/announcement — pelengkap CRUD API-136 (create).
// Otorisasi lewat RLS public_announcement_promotion_manage_m11 (0028).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateBannerSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { removeAnnouncementMediaByUrl } from "@/lib/storage/announcement-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Banner/announcement tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateBannerSchema);
  const supabase = await createClient();

  const { data: before } = await supabase.from("public_announcement_promotion").select("image_reference").eq("id", ctx.params.id).maybeSingle<{ image_reference: string | null }>();

  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .update({ ...body, updated_by: ctx.userId })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Banner/announcement tidak ditemukan atau Anda tidak punya akses.");
  }

  // Gambar lama dihapus dari storage setelah diganti atau dilepas (URL eksternal/lama diabaikan).
  if (before && "image_reference" in body && before.image_reference && before.image_reference !== data.image_reference) {
    await removeAnnouncementMediaByUrl(before.image_reference);
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle<{ image_reference: string | null }>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Banner/announcement tidak ditemukan atau Anda tidak punya akses.");
  }

  await removeAnnouncementMediaByUrl(data.image_reference);

  return { data: { id: ctx.params.id, deleted: true } };
});
