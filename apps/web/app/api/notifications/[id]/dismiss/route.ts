// app/api/notifications/[id]/dismiss/route.ts
// ADD-NEW — tidak ada route "dismiss" evidenced di STEP11-A (baseline 236
// hanya punya "read"/"read-all"). Kolom `dismissed_at` sendiri juga ADD-NEW
// di migration 0036 untuk menutup gap D13-07 ("Implementasikan operasi
// dismiss/delivery-state untuk Notification State"). Route ini yang menutup
// gap itu di lapisan HTTP — tanpa route ini, kolom `dismissed_at` yang sudah
// dibuat DB tidak punya cara dipakai dari luar.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ dismissed_at: new Date().toISOString() })
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
