// app/api/authorization/roles/route.ts
// Contoh route nyata pertama, sekaligus bukti bahwa lib/api/handler.ts (Step 2)
// dan migration M10 (Step 1) benar-benar nyambung end-to-end. Sumber semantik:
// STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv baris "M10,Role Catalogue,View,
// ALL,ALL,ALL,NONE,NONE,NONE,NONE,...".
//
// PENTING: route ini TIDAK mengecek permission secara manual — otorisasi
// sepenuhnya diserahkan ke RLS policy `roles_select` di
// supabase/migrations/0007_authorization_rls_policies.sql (menegakkan R-02:
// satu sumber keputusan akses). Kalau caller tidak punya izin, Supabase akan
// mengembalikan baris kosong (RLS), bukan error — ini perilaku standar
// PostgREST/Supabase untuk SELECT dan disengaja.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const {
    data,
    count,
    error,
  } = await supabase
    .from("roles")
    .select("id, code, name, is_system_role, is_protected", { count: "exact" })
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    data,
    pagination: buildPaginationMeta(limit, offset, count ?? 0),
  };
});
