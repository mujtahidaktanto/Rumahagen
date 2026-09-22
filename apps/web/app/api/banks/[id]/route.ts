// app/api/banks/[id]/route.ts
// GET satu bank + PUT update (M07 Bank Master, migration 0089). Otorisasi
// sama seperti app/api/banks/route.ts -- banks_select/banks_manage.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateBankSchema } from "@/lib/validation/banks";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("banks").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Bank tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateBankSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banks")
    .update({ ...body, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Bank tidak ditemukan atau Anda tidak punya akses untuk mengubahnya.");
  }

  return { data };
});
