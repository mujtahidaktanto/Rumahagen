// app/api/url-redirects/[id]/route.ts
// ADD-NEW — kelola satu baris url_redirects (staf, RLS url_redirects_manage
// via m11.static_public_content.publish). PUT = ganti penuh (skema sama dengan POST; field opsional yang tidak dikirim kembali ke
// bawaan: redirect_type 301, reason/entity kosong). old_path ganda -> 409, CHECK/trigger putaran (23514) -> 409.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { createUrlRedirectSchema } from "@/lib/validation/url-redirects";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createUrlRedirectSchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("url_redirects")
    .update({
      old_path: body.old_path,
      new_path: body.new_path,
      redirect_type: body.redirect_type ?? 301,
      reason: body.reason ?? null,
      entity_type: body.entity_type ?? null,
      entity_id: body.entity_id ?? null,
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Jalur lama ini sudah punya pengalihan.");
    }
    if (error.code === "23514") {
      throw new ApiError("CONFLICT", error.message.replace(/^[a-z_]+: /, ""));
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Redirect tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("url_redirects")
    .delete()
    .eq("id", ctx.params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Redirect tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
