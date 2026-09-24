// app/api/agents/me/awards/presentation/route.ts
// API-234 GET /agents/me/awards/presentation (Agent, semua milik sendiri termasuk non-aktif), API-235 PUT /agents/me/awards/presentation (Agent — mengganti
// SELURUH pilihan title tampilan: 1 utama + maksimal 3 tambahan berurutan, lewat fungsi set_my_public_titles, migration 0148).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { setTitlePresentationsSchema } from "@/lib/validation/title-presentations";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat presentasi title milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_presentations")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengatur presentasi title milik sendiri.");
  }

  const body = await validateJsonBody(ctx.request, setTitlePresentationsSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_my_public_titles", {
    p_primary: body.primary_title_id ?? null,
    p_additional: body.additional_title_ids ?? [],
  });

  if (error) {
    throwIntegrityError(error);
  }

  return { data };
});
