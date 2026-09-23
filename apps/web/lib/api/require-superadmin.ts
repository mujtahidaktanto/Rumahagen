// lib/api/require-superadmin.ts
// Pengecekan eksplisit is_superadmin() lewat RPC (sesi asli, R-02 —
// fungsi otorisasi yang sama dari 0006, bukan logika baru) untuk endpoint
// yang butuh Superadmin-only TANPA RLS tabel tunggal yang bisa
// menegakkannya sendiri (mis. Internal Staff User Management: butuh
// memanggil Supabase Admin API, bukan cuma query satu tabel) — pola sama
// yang sudah dipakai app/api/admin/reports/export/route.ts.

import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";

export async function requireSuperadmin(supabase: SupabaseClient): Promise<void> {
  const { data: allowed, error } = await supabase.rpc("is_superadmin");
  if (error) {
    throw error;
  }
  if (!allowed) {
    throw new ApiError("FORBIDDEN", "Hanya Superadmin yang punya akses untuk operasi ini.");
  }
}
