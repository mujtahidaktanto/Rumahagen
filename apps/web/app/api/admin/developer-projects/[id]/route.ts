// app/api/admin/developer-projects/[id]/route.ts
// API-121 PUT (update, termasuk publish/activate), API-122 DELETE
// /admin/developer-projects/{id}. RLS DELETE baru ditambahkan migration
// 0040 (lihat rasional di file itu — gap yang sama seperti events/0039).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateDeveloperProjectSchema } from "@/lib/validation/developer-projects";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateDeveloperProjectSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("developer_projects")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("m06.developer_project.publish")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer project tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_projects")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer project tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
