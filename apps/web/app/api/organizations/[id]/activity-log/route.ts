// app/api/organizations/[id]/activity-log/route.ts
// GET /organizations/{id}/activity-log — API-168 (M12, STEP11-B6 §19).
// "M12 activity/history is Organization-scoped history. It is not a
// duplicate M09 administrative audit subsystem" -- dibaca sebagai: JANGAN
// bangun mekanisme logging KEDUA, cukup BACA audit_logs (M09, sudah ada
// kolom organization_id sejak 0012/log_audit_event) yang difilter ke
// organisasi ini -- permukaan otorisasi M12-nya sendiri (member/staf)
// yang beda dari GET /admin/audit-logs (Superadmin+Manager platform-wide).
//
// Dicek eksplisit lewat RPC is_org_member (bukan cuma RLS audit_logs yang
// sudah ada) karena audit_logs_select (0012) TIDAK pernah mengizinkan
// member organisasi biasa melihat baris apa pun -- hanya staf M09. Kalau
// dibiarkan begitu saja, member non-staf akan selalu dapat array kosong
// -- bukan akses yang benar-benar berfungsi seperti yang dikunci B6 §19.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: isMember, error: memberErr } = await supabase.rpc("is_org_member", { p_organization_id: ctx.params.id });
  if (memberErr) throw memberErr;
  if (!isMember) {
    throw new ApiError("FORBIDDEN", "Hanya member aktif atau staf yang bisa melihat activity log organisasi ini.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  // is_org_member() sudah memvalidasi otorisasi di atas -- admin client
  // dipakai HANYA supaya member non-staf (yang RLS audit_logs_select-nya
  // sendiri tidak pernah lolos) bisa membaca baris organisasinya sendiri,
  // pola sama seperti lib/supabase/admin.ts (pengecekan permission
  // eksplisit dulu, baru admin client untuk query tanpa batasan RLS
  // staff-only itu).
  const admin = createAdminClient();
  const { data, count, error } = await admin
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, user_id, old_value, new_value, created_at", { count: "exact" })
    .eq("organization_id", ctx.params.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
