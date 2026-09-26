// app/api/agents/me/avatar/route.ts
// PUT /agents/me/avatar { path } — memasang foto profil yang sudah diunggah lewat /agents/me/avatar/upload-url: path harus berada di folder pemanggil dan objeknya harus ada. Foto lama
// dihapus dari storage. DELETE — melepas foto (kembali ke inisial) dan menghapus berkasnya.

import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { AVATAR_BUCKET } from "@/lib/media/variants";
import { objectExists, ownAvatarPath, pathInBucket, publicUrl, removeObjects } from "@/lib/storage/public-images";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ path: z.string().min(1).max(300) });

async function currentAvatar(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase.from("agent_profiles").select("id, avatar_url").eq("user_id", userId).maybeSingle<{ id: string; avatar_url: string | null }>();
  if (error) throw error;
  if (!data) throw new ApiError("CONFLICT", "Lengkapi profil Agent lebih dulu.");
  return { id: data.id, path: data.avatar_url ? pathInBucket(data.avatar_url, AVATAR_BUCKET) : null };
}

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const { path } = await validateJsonBody(ctx.request, bodySchema);
  if (!ownAvatarPath(ctx.userId, path)) throw new ApiError("VALIDATION_ERROR", "Berkas foto tidak valid.");
  if (!(await objectExists(AVATAR_BUCKET, path))) throw new ApiError("CONFLICT", "Foto belum terunggah. Coba unggah lagi.");

  const supabase = await createClient();
  const old = await currentAvatar(supabase, ctx.userId);
  const { data, error } = await supabase.from("agent_profiles").update({ avatar_url: publicUrl(AVATAR_BUCKET, path) }).eq("id", old.id).select("avatar_url").maybeSingle();
  if (error) throw error;
  if (old.path && old.path !== path) await removeObjects(AVATAR_BUCKET, [old.path]);
  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const supabase = await createClient();
  const old = await currentAvatar(supabase, ctx.userId);
  const { error } = await supabase.from("agent_profiles").update({ avatar_url: null }).eq("id", old.id);
  if (error) throw error;
  if (old.path) await removeObjects(AVATAR_BUCKET, [old.path]);
  return { data: { avatar_url: null } };
});
