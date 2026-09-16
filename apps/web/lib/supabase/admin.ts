// lib/supabase/admin.ts
// Client dengan SERVICE ROLE KEY — bypass RLS sepenuhnya. HANYA dipakai di
// route handler yang memang butuh operasi lintas-user di luar jangkauan RLS
// (mis. FORCE_REVOKE Provider/BYOK di M13 — lihat residual D13-10), dan HARUS
// tetap melakukan pengecekan has_permission()/is_superadmin() secara eksplisit
// di kode route sebelum memanggil ini — bypass RLS bukan berarti bypass
// otorisasi (menegakkan R-02: keputusan akses tetap dari fungsi 0006, bukan
// dari fakta "pakai service role").
//
// JANGAN pernah import file ini dari kode yang berjalan di browser.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
