// app/api/agents/me/subscriptions/route.ts
// GET /agents/me/subscriptions — Agent, langganan milik sendiri (M14, tabel subscriptions 0071), paginated. Dipakai layar "Langganan Saya".
// RLS subscriptions_select (0071): pemilik lewat m14.commercial_purchase_access.own_purchase berdasarkan user_id; filter user_id tetap dipasang
// eksplisit supaya staf (yang melihat semua baris) hanya mendapat langganan dirinya di endpoint "me".
// Batasan: langganan milik organisasi tanpa user_id belum terbaca anggota (policy berbasis user_id). Belum ada pembelian/perpanjangan/pembatalan
// langganan (tidak ada endpoint tulis; baris hanya dibuat staf).
// Respons menambah status turunan: effective_status (active|expiring|expired|pending|cancelled|unknown), days_left, is_current.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { listMySubscriptionsQuerySchema } from "@/lib/validation/subscriptions";
import { deriveSubscriptionState } from "@/lib/commercial/subscription-state";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat langganan milik sendiri.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, listMySubscriptionsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("subscriptions")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.active_only === "true") {
    // Langganan yang statusnya 'active' dan belum lewat ends_at; status turunan (expiring) tetap ikut karena masih berlaku.
    query = query.eq("status", "active").or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  const now = new Date();
  const rows = (data ?? []).map((row) => ({ ...row, ...deriveSubscriptionState(row, now) }));

  return { data: rows, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
