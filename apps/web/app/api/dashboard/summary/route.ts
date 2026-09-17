// app/api/dashboard/summary/route.ts
// API-137 GET /dashboard/summary. Sumber semantik: STEP11-A menyebut M08
// sebagai "reusable projection/notification infrastructure" TANPA memberi
// skema/dataset ringkasan yang konkret (beda dengan /notifications yang
// jelas backing table-nya) — mengikuti pola D13-12/API-138 di M09 (tidak
// mengarang dataset yang tidak evidenced), scope endpoint ini SENGAJA
// dipersempit ke SATU proyeksi yang benar-benar punya tabel: ringkasan
// notifikasi milik pemanggil sendiri (unread/total), digerbangi permission
// m08.dashboard_projection.read (0009 seed) yang memang scope-nya 'own'
// untuk role non-staff. Kalau kebutuhan dashboard lebih luas (listing count,
// LP balance, dst.) muncul nyata, itu perluasan endpoint ini di masa depan,
// bukan diasumsikan sekarang.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat ringkasan dashboard.");
  }

  const supabase = await createClient();
  const { count: totalCount, error: totalErr } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .is("dismissed_at", null);
  if (totalErr) {
    throw totalErr;
  }

  const { count: unreadCount, error: unreadErr } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("is_read", false)
    .is("dismissed_at", null);
  if (unreadErr) {
    throw unreadErr;
  }

  return {
    data: {
      notifications: {
        total: totalCount ?? 0,
        unread: unreadCount ?? 0,
      },
    },
  };
});
