// app/api/notifications/route.ts
// API-131 GET /notifications — inbox notifikasi milik pemanggil sendiri.
// SENGAJA filter eksplisit `.eq("user_id", ctx.userId)` walau RLS
// notifications_select (0036) juga mengizinkan Superadmin/Admin/Manager
// melihat SEMUA baris (scope 'all' di seed 0009) — endpoint ini secara
// semantik adalah "inbox pribadi" (API-131), bukan tool browse-all admin,
// jadi di-scope eksplisit di sini terlepas dari seberapa luas RLS caller
// (pola sama seperti agents/me/listings).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { listNotificationsQuerySchema } from "@/lib/validation/notifications";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat notifikasi.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listNotificationsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.is_read !== undefined) query = query.eq("is_read", filters.is_read);
  if (!filters.include_dismissed) query = query.is("dismissed_at", null);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
