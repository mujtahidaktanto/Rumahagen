// app/api/admin/notifications/push/route.ts
// API-134 POST /admin/notifications/push — bungkus fungsi create_notification()
// dari 0036 (satu-satunya jalur fisik pembuatan notifikasi, Gate PRE-00-J
// §12-14: "Notification State ≠ Notification Creation" — M08 sendiri TIDAK
// PUNYA permission untuk membuat notifikasi). Otorisasi dicek DI DALAM fungsi
// (Superadmin/Admin-only untuk pemanggilan manual dari sesi user biasa) — R-02,
// tidak diduplikasi di route ini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { pushNotificationSchema } from "@/lib/validation/notifications";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, pushNotificationSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("create_notification", {
      p_user_id: body.user_id,
      p_type: body.type,
      p_title: body.title ?? null,
      p_message: body.message ?? null,
      p_related_entity_type: body.related_entity_type ?? null,
      p_related_entity_id: body.related_entity_id ?? null,
    })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("Superadmin/Admin")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
