// app/api/learning/sessions/[id]/enrollments/route.ts
// API-092 POST (enrollment request), API-094 GET (list enrollment untuk satu
// session — dipakai owner/staff). Otorisasi lewat RLS
// session_enrollments_insert/_select (0021).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createEnrollmentSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mendaftar session.");
  }

  const body = await validateJsonBody(ctx.request, createEnrollmentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_enrollments")
    .insert({ session_id: ctx.params.id, agent_id: ctx.userId, activation_reference: body.activation_reference ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Anda sudah terdaftar di session ini.");
    }
    throw error;
  }

  return { data, status: 201 };
});

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_enrollments")
    .select("*")
    .eq("session_id", ctx.params.id)
    .order("requested_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
