// app/api/learning/session-enrollments/[id]/route.ts
// API-095 GET (detail), API-097 DELETE (withdrawal/cancellation — RLS baru
// dari migration 0042, lihat rasional di file itu: staf-only, BUKAN
// permission baru sesuai Gate §26 "NO NEW PERMISSION").

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_enrollments")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Session enrollment tidak ditemukan.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_enrollments")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Session enrollment tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
