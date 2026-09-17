// lib/validation/notifications.ts
// Skema Zod untuk M08 Notifications (STEP11-A API-131/132/133/134/137).
// Field persis mengikuti kolom `public.notifications` di
// supabase/migrations/0036_m08_notifications.sql.

import { z } from "zod";

// GET /notifications — filter dasar untuk inbox milik sendiri.
export const listNotificationsQuerySchema = z.object({
  is_read: z.coerce.boolean().optional(),
  include_dismissed: z.coerce.boolean().optional().default(false),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

// POST /admin/notifications/push — bungkus create_notification() (0036).
// Superadmin/Admin-only, ditegakkan fungsinya sendiri (bukan diduplikasi di
// sini) — Gate PRE-00-J §14 "Admin Notification Push".
export const pushNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum([
    "approval_status",
    "event_reminder",
    "listing_expiring",
    "certificate_issued",
    "lead_new",
    "lainnya",
  ]),
  title: z.string().max(200).optional(),
  message: z.string().optional(),
  related_entity_type: z.string().max(50).optional(),
  related_entity_id: z.string().uuid().optional(),
});
export type PushNotificationInput = z.infer<typeof pushNotificationSchema>;
