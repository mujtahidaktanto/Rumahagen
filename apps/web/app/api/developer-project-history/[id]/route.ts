// app/api/developer-project-history/[id]/route.ts
// PUT update, DELETE satu entri riwayat perumahan. Otorisasi lewat RLS developer_project_history_manage (migration 0172).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateDeveloperProjectHistorySchema } from "@/lib/validation/developer-partners";
import { ApiError } from "@/lib/api/errors";
import { removeDeveloperMediaByUrl } from "@/lib/storage/developer-media";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateDeveloperProjectHistorySchema);
  const supabase = await createClient();

  const { data: before } = await supabase.from("developer_project_history").select("logo_url").eq("id", ctx.params.id).maybeSingle<{ logo_url: string | null }>();

  const { data, error } = await supabase
    .from("developer_project_history")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("NOT_FOUND", "Entri riwayat tidak ditemukan atau Anda tidak punya akses.");
  }

  if (before && "logo_url" in body && before.logo_url && before.logo_url !== data.logo_url) {
    await removeDeveloperMediaByUrl(before.logo_url);
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_history")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("NOT_FOUND", "Entri riwayat tidak ditemukan atau Anda tidak punya akses.");
  }

  await removeDeveloperMediaByUrl(data.logo_url);
  return { data: { id: ctx.params.id, deleted: true } };
});
