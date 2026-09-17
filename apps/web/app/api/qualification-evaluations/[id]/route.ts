// app/api/qualification-evaluations/[id]/route.ts
// API-217 GET /qualification-evaluations/{evaluation_id}. Otorisasi lewat
// RLS qualification_evaluations_select (0026) — m15.qualification.administer.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qualification_evaluations")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Qualification evaluation tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
