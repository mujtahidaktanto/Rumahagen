// app/api/awarding-paths/[id]/route.ts
// API-207 GET /awarding-paths/{path_id} (scoped),
// API-208 PUT /awarding-paths/{path_id} (authorized authority).
// Otorisasi lewat RLS awarding_paths_manage (0064) — SELECT/UPDATE staff-only,
// pola FOR ALL yang sama juga menggerbangi GET (bukan publik seperti
// title_definitions).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateAwardingPathSchema } from "@/lib/validation/awarding-paths";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awarding_paths")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding path tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateAwardingPathSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_paths")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding path tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
