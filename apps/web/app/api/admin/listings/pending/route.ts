// app/api/admin/listings/pending/route.ts
// GET /admin/listings/pending — API-036 (M03 Admin Listing Review,
// STEP11-A, PRESERVE — admin-surface gap #1). "Preserve existing admin
// review route; NOT a normal Listing Publish gate" -- dikonfirmasi
// eksplisit oleh user: alur M03 normal TETAP DRAFT->PUBLISH->PUBLISHED
// tanpa gate apa pun (Gate PRE-00-E §6-9, migration 0018). Endpoint ini
// adalah jalur ADMINISTRATIF/EKSEPSIONAL terpisah untuk manual review
// PASCA-publish (mis. listing yang sudah live ternyata gambarnya
// melanggar aturan) -- BUKAN pre-publish approval.
//
// Listing masuk ke status 'pending_review' lewat PATCH /listings/{id}/
// status yang SUDAH ADA (tidak ada endpoint "flag" baru di sini): staf
// (Superadmin/Admin/Manager) sudah bisa mencapai baris listing siapa pun
// lewat RLS listings_update (permission m03.listing.suspend, scope 'all'
// sejak 0086/0090), dan transisi ke/dari 'pending_review' TIDAK digerbangi
// IF block khusus apa pun di trigger enforce_listing_lifecycle_rules --
// jadi kemampuan ini sudah lolos sebelum batch ini dibuat. Endpoint di
// sini murni melihat/memutuskan antrian yang sudah terbentuk.
//
// Otorisasi: m03.listing.suspend (staf enforcement, Superadmin/Admin/
// Manager = all, Agent = none) dicek EKSPLISIT lewat RPC has_permission()
// -- bukan cuma mengandalkan RLS SELECT listings yang sudah longgar untuk
// staf (kalau dibiarkan begitu saja, Agent tetap bisa memanggil endpoint
// ini dan melihat listing miliknya sendiri yang sedang di-review lewat
// RLS agent_id=auth.uid(), padahal path ini "/admin/" -- gate eksplisit
// menutup celah semantik itu).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { requirePermission } from "@/lib/api/require-permission";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  await requirePermission(
    supabase,
    "m03.listing.suspend",
    "Hanya staf (Superadmin/Admin/Manager) yang bisa melihat antrian review listing.",
  );

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const { data, count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
