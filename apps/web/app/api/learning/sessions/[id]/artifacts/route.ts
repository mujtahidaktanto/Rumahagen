// app/api/learning/sessions/[id]/artifacts/route.ts
// API-110 GET (read permitted artifacts), API-111 POST (register metadata).
// Otorisasi lewat RLS session_artifacts_select/_manage (0022).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createArtifactSchema } from "@/lib/validation/learning-sessions";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_artifacts")
    .select("*")
    .eq("session_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createArtifactSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_artifacts")
    .insert({ ...body, session_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
