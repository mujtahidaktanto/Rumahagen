// app/api/admin/notification-templates/route.ts
// ADD-NEW — tidak ada route evidenced di STEP11-A untuk resource ini (tabel
// notification_templates sendiri juga ADD-NEW sejak 0013, menutup D13-08).
// Hanya GET list di sini; tidak ada POST — 6 nilai `type` sudah dikunci CHECK
// constraint & di-seed penuh sejak 0013, template baru tidak bisa dibuat lewat
// API, hanya diubah (lihat [type]/route.ts).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("notification_templates").select("*").order("type");

  if (error) {
    throw error;
  }

  return { data };
});
