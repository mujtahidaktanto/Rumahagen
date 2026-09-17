// app/api/organizations/[id]/entitlements/route.ts
// API-188 GET /organizations/{organization_id}/entitlements —
// Organization-scoped authority. CATATAN KETERBATASAN EVIDENCED: RLS
// commercial_entitlements_select (0019) hanya mengecek has_permission(...,
// user_id) — TIDAK ADA jalur organization-membership (M12) di RLS yang
// sudah applied. STEP11-B7 §17 menyebut "Organization-scoped entitlement/
// quota reads... remain governed by M10 authorization plus M12 context"
// sebagai boundary semantik, TAPI physical RLS 0019 belum merealisasikannya
// untuk anggota organisasi selain pemilik baris sendiri. Route ini query
// apa adanya sesuai RLS yang ada (filter organization_id, PostgREST tetap
// menerapkan commercial_entitlements_select) — TIDAK menambah RLS baru yang
// tidak dievidence.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("commercial_entitlements")
    .select("*", { count: "exact" })
    .eq("organization_id", ctx.params.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
