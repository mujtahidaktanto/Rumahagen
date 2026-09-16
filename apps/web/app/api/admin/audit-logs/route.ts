// app/api/admin/audit-logs/route.ts
// API-149 GET /admin/audit-logs — read-only (menegakkan "audit log harus
// append-only": tidak ada POST/PUT/DELETE route sama sekali, satu-satunya
// jalur tulis adalah fungsi log_audit_event() SECURITY DEFINER dari 0012,
// dipanggil modul lain, bukan lewat HTTP langsung). Otorisasi lewat RLS
// audit_logs_select (has_permission m09.administrative_audit_log.view) —
// menutup D13-13.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateSearchParams } from "@/lib/api/validate";
import { auditLogsQuerySchema } from "@/lib/validation/admin";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const filters = validateSearchParams(url.searchParams, auditLogsQuerySchema);

  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.entity_type) query = query.eq("entity_type", filters.entity_type);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.user_id) query = query.eq("user_id", filters.user_id);
  if (filters.organization_id) query = query.eq("organization_id", filters.organization_id);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  return {
    data,
    pagination: buildPaginationMeta(limit, offset, count ?? 0),
  };
});
