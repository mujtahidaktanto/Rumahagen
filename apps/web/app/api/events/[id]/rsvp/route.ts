// app/api/events/[id]/rsvp/route.ts
// API-081 POST /events/{id}/rsvp — satu endpoint untuk self DAN guest
// registration (participant_mode), sesuai catatan 0032. `agent_id` selalu
// pemanggil (untuk mode 'guest', artinya agent yang MENDAFTARKAN tamu, bukan
// tamunya sendiri — pola sama seperti dijelaskan di komentar migration 0032).
// Otorisasi lewat RLS event_registrations_insert (has_permission
// m05.event_registration.create ATAU m05.guest_registration.create
// tergantung participant_mode) — R-02.
//
// TIDAK ADA pengecekan kuota/kapasitas di sini — kolom `events.quota` ada di
// skema tapi tidak ada trigger/constraint DB yang menegakkannya, dan tidak
// ada residual/gate yang mendokumentasikan aturan enforcement-nya. Menambah
// logika itu di route berarti mengarang business rule yang tidak evidenced.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { rsvpSchema } from "@/lib/validation/events";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk RSVP event.");
  }

  const body = await validateJsonBody(ctx.request, rsvpSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: ctx.params.id,
      agent_id: ctx.userId,
      participant_mode: body.participant_mode,
      guest_email: body.guest_email ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
