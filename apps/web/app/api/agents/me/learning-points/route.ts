// app/api/agents/me/learning-points/route.ts
// API-069 GET /agents/me/learning-points — LP balance milik pemanggil
// sendiri. Otorisasi lewat RLS learning_point_accounts_select (0023,
// has_permission m04.learning_point.view, user_id) — R-02.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat LP balance.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_point_accounts")
    .select("*")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Belum pernah menerima transaksi LP sama sekali = belum punya baris
  // account (dibuat otomatis oleh grant_learning_points_from_purchase()/
  // adjust_learning_points() saat pertama kali dibutuhkan) — bukan error,
  // saldo 0 adalah kondisi bisnis valid.
  return { data: data ?? { user_id: ctx.userId, balance_projection: 0, status: "active" } };
});
