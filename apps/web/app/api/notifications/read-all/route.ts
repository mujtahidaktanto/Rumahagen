// app/api/notifications/read-all/route.ts
// API-133 PUT /notifications/read-all — tandai semua notifikasi milik
// pemanggil sebagai terbaca. SENGAJA scoped `.eq("user_id", ctx.userId)`
// eksplisit (bukan cuma RLS) — sama seperti alasan di app/api/notifications/route.ts,
// supaya Superadmin/Admin yang scope RLS-nya 'all' tidak tanpa sengaja
// menandai SEMUA notifikasi SEMUA user sebagai terbaca lewat endpoint ini.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk menandai notifikasi.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", ctx.userId)
    .eq("is_read", false)
    .select("id");

  if (error) {
    throw error;
  }

  return { data: { updated_count: data?.length ?? 0 } };
});
