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
import { throwIntegrityError } from "@/lib/api/integrity-error";
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
    // Trigger trg_event_registration_approval_mode (0088) RAISE EXCEPTION
    // saat registration_approval_mode=closed — bedakan dari error tak
    // terduga supaya client dapat 409 (aturan bisnis), bukan 500 generik.
    if (typeof error.message === "string" && error.message.includes("pendaftaran ditutup")) {
      throw new ApiError("CONFLICT", error.message);
    }
    // 0160: satu pendaftaran aktif per Agent per event; event belum tayang/privat/status awal salah = 409 berpesan.
    if (error.code === "23505") throw new ApiError("CONFLICT", "Anda sudah terdaftar di event ini.");
    throwIntegrityError(error);
  }

  return { data, status: 201 };
});

// DELETE /events/{id}/rsvp — peserta membatalkan pendaftaran SELF miliknya sendiri (registered|waitlist|pending_approval -> cancelled). Trigger 0160 hanya mengizinkan pembatalan oleh peserta.
export const DELETE = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .update({ status: "cancelled" })
    .eq("event_id", ctx.params.id)
    .eq("agent_id", ctx.userId)
    .eq("participant_mode", "self")
    .in("status", ["registered", "waitlist", "pending_approval"])
    .select("id, status")
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Pendaftaran aktif tidak ditemukan atau sudah tidak bisa dibatalkan.");
  }
  return { data };
});
