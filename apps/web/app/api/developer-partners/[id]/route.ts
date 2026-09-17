// app/api/developer-partners/[id]/route.ts
// GET satu partner, PUT update, DELETE. Otorisasi lewat RLS
// developer_partners_select/developer_partners_manage (0033).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateDeveloperPartnerSchema } from "@/lib/validation/developer-partners";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateDeveloperPartnerSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("developer_partners")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
