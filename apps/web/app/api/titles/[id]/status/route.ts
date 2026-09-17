// app/api/titles/[id]/status/route.ts
// API-204 PATCH /titles/{title_id}/status — transisi lifecycle
// draft/active/inactive/retired. RLS title_definitions_manage yang sama
// menggerbangi semua perubahan field termasuk status (pola sama seperti
// learning_sessions status route).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { titleStatusSchema } from "@/lib/validation/titles";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, titleStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("title_definitions")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Title tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
