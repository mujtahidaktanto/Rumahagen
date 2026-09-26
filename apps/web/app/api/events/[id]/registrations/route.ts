// app/api/events/[id]/registrations/route.ts
// GET /events/{id}/registrations — daftar pendaftar untuk penyelenggara event (atau staf): status, nama Agent, kantor, email tamu. Lewat RPC event_registrants (migration 0160) karena RLS
// agent_profiles tidak mengizinkan penyelenggara membaca profil peserta.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("event_registrants", { p_event_id: ctx.params.id });
  if (error) {
    if (error.code === "42501") throw new ApiError("FORBIDDEN", "Hanya penyelenggara event yang bisa melihat daftar pendaftar.");
    throw error;
  }
  return { data: data ?? [] };
});
