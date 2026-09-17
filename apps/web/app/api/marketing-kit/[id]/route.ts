// app/api/marketing-kit/[id]/route.ts
// GET satu file kit, PUT update, DELETE. Otorisasi lewat RLS
// marketing_kit_select/marketing_kit_manage (0035).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateMarketingKitSchema } from "@/lib/validation/marketing-kit";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("marketing_kit").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateMarketingKitSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_kit")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_kit")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
