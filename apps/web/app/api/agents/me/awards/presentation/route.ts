// app/api/agents/me/awards/presentation/route.ts
// API-234 GET /agents/me/awards/presentation (Agent, semua milik sendiri
// termasuk non-aktif — RLS title_presentations_select mengizinkan pemilik
// lihat semua), API-235 PUT /agents/me/awards/presentation (Agent — replace-
// set: upsert setiap item berdasarkan UNIQUE(user_id, title_definition_id)).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { setTitlePresentationsSchema } from "@/lib/validation/title-presentations";
import { ApiError } from "@/lib/api/errors";
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

  const rows = body.presentations.map((p) => ({ ...p, user_id: ctx.userId }));

  const { data, error } = await supabase
    .from("title_presentations")
    .upsert(rows, { onConflict: "user_id,title_definition_id" })
    .select();

  if (error) {
    throw error;
  }

  return { data };
});
