// app/api/developer-projects/[id]/media/route.ts
// GET (list foto/video resmi satu project), POST (tambah media). Otorisasi
// lewat RLS developer_project_media_select/developer_project_media_manage
// (0034) — publik lihat media project yang statusnya active/coming_soon/
// sold_out, Developer Partner pemilik + staf bisa kelola.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createProjectMediaSchema } from "@/lib/validation/project-media";
import { ApiError } from "@/lib/api/errors";
import { mediaUrlOwnership } from "@/lib/storage/project-files";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_media")
    .select("*")
    .eq("project_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createProjectMediaSchema);
  const supabase = await createClient();

  if (mediaUrlOwnership(body.url, ctx.params.id ?? "") === "foreign_project") {
    throw new ApiError("VALIDATION_ERROR", "URL file milik proyek lain.");
  }

  const { data, error } = await supabase
    .from("developer_project_media")
    .insert({ ...body, project_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
