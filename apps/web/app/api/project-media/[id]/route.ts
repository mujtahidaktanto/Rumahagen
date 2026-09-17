// app/api/project-media/[id]/route.ts
// DELETE satu item media. Otorisasi lewat RLS developer_project_media_manage
// (0034).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_media")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Media tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
