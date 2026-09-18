// app/api/ref-villages/[id]/route.ts
// ADD-NEW — kelola satu baris ref_villages (Superadmin, RLS
// ref_villages_write_superadmin).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateRefVillageSchema } from "@/lib/validation/ref-villages";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateRefVillageSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ref_villages")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Desa/kelurahan tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ref_villages")
    .delete()
    .eq("id", ctx.params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Desa/kelurahan tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
