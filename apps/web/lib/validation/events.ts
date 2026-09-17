// lib/validation/events.ts
// Skema Zod untuk M05 Event (STEP11-A API-079/080/081/082/083/084). Field
// persis mengikuti kolom `public.events`/`public.event_registrations` di
// supabase/migrations/0031_m05_events.sql / 0032_m05_event_registrations.sql.

import { z } from "zod";

export const createEventSchema = z.object({
  submitted_by: z.string().uuid().optional(), // opsional: default ke pemanggil, pola sama seperti listings.agent_id
  title: z.string().min(1).max(200),
  category: z.enum(["training", "launching_proyek", "open_house", "gathering"]),
  description: z.string().optional(),
  is_online: z.boolean().optional(),
  location: z.string().max(255).optional(),
  meeting_link: z.string().max(500).optional(),
  host: z.string().max(150).optional(),
  quota: z.coerce.number().int().positive().optional(),
  related_course_id: z.string().uuid().optional(),
  related_project_id: z.string().uuid().optional(),
  visibility: z.enum(["public", "organization", "private"]).optional(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().optional(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

// PUT /events/{id} (API-083) — mencakup update biasa MAUPUN transisi status
// (published/cancelled/rejected), karena STEP11-A memodelkan Event dengan
// SATU route generic PUT (beda dari Listing yang punya PATCH .../status
// terpisah). Trigger trg_event_lifecycle_permissions (0031) yang menegakkan
// permission spesifik untuk transisi ke published/cancelled — tidak
// diduplikasi di sini (R-02).
export const updateEventSchema = createEventSchema
  .omit({ submitted_by: true })
  .partial()
  .extend({
    status: z.enum(["pending_approval", "published", "rejected", "cancelled"]).optional(),
  });
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const listEventsQuerySchema = z.object({
  category: z.enum(["training", "launching_proyek", "open_house", "gathering"]).optional(),
  is_online: z.coerce.boolean().optional(),
});
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

// POST /events/{id}/rsvp (API-081) — satu endpoint untuk self DAN guest
// registration (dibedakan `participant_mode`), sesuai catatan 0032: "TIDAK
// ada tabel terpisah untuk Guest Registration... satu tabel fisik yang sama".
export const rsvpSchema = z
  .object({
    participant_mode: z.enum(["self", "guest"]).optional().default("self"),
    guest_email: z.string().email().optional(),
  })
  .refine((v) => v.participant_mode !== "guest" || !!v.guest_email, {
    message: "guest_email wajib diisi kalau participant_mode=guest",
    path: ["guest_email"],
  });
export type RsvpInput = z.infer<typeof rsvpSchema>;
