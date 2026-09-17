// app/api/notifications/[id]/read/route.ts
// API-132 PUT /notifications/{id}/read. Otorisasi lewat RLS
// notifications_update_state (has_permission m08.notification_state.update_state,
// 0036) — trigger trg_notification_state_only_update memastikan hanya
// is_read/dismissed_at/delivery_status yang bisa berubah lewat UPDATE ini,
// bukan isi notifikasi (Gate PRE-00-J §12: Notification State ≠ Creation).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Notifikasi tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
