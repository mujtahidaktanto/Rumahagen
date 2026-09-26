// app/api/agents/me/refresh-allowance/route.ts
// GET /agents/me/refresh-allowance — jatah Refresh Listing harian milik pemanggil (migration 0159): { default_daily, extra_daily, allowance, used_today, remaining_today, resets_at }.
// Jatah efektif = bawaan sistem (system_configs refresh_allowance.default_daily, bawaan 5) + tambahan aktif (bonus Superadmin, add-on). Reset tiap 00.00 WIB.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat jatah refresh.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_refresh_allowance");
  if (error) throw error;
  return { data };
});
