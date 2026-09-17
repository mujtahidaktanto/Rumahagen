// app/api/learning/sessions/[id]/event/route.ts
// API-113 GET, API-114 PUT (update asosiasi), API-115 DELETE (hapus asosiasi)
// — `learning_sessions.event_id` adalah link longgar ke Event (M05), M04
// tetap authority atas Session (STEP11-B5 §14: "Association does not
// transfer authority"). Otorisasi lewat RLS learning_sessions_select/_update
// (0021) — event_id hanyalah salah satu kolom biasa.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { sessionEventAssociationSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .select("id, event_id")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning session tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, sessionEventAssociationSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_sessions")
    .update({ event_id: body.event_id })
    .eq("id", ctx.params.id)
    .select("id, event_id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning session tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .update({ event_id: null })
    .eq("id", ctx.params.id)
    .select("id, event_id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Learning session tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
