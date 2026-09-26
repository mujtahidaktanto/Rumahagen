// app/api/events/[id]/registrations/{registrationId}/route.ts
// PATCH /events/{id}/registrations/{registrationId} { status } — penyelenggara menyetujui (registered), menolak/membatalkan (cancelled), atau menandai hadir (attended). Otorisasi lewat RLS
// event_registrations_update_organizer dan trigger 0160 (transisi yang diizinkan, hanya kolom status). Peserta memakai DELETE /events/{id}/rsvp untuk membatalkan pendaftarannya sendiri.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { registrationStatusSchema } from "@/lib/validation/events";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, registrationStatusSchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .update({ status: body.status })
    .eq("id", ctx.params.registrationId)
    .eq("event_id", ctx.params.id)
    .select("id, status")
    .maybeSingle();
  if (error) throwIntegrityError(error);
  if (!data) throw new ApiError("NOT_FOUND", "Pendaftaran tidak ditemukan atau Anda bukan penyelenggara event ini.");
  return { data };
});
