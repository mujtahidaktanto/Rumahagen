// app/api/titles/[id]/route.ts
// API-201 GET /titles/{title_id} (public), API-203 PUT /titles/{title_id}
// (authorized awarding authority).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateTitleSchema } from "@/lib/validation/titles";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_definitions")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Title tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateTitleSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("title_definitions")
    .update(body)
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
