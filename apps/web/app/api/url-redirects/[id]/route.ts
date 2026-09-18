// app/api/url-redirects/[id]/route.ts
// ADD-NEW — kelola satu baris url_redirects (staf, RLS url_redirects_manage
// via m11.static_public_content.publish).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

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
