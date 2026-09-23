// lib/api/require-permission.ts
// Pengecekan permission generik lewat RPC has_permission() (sesi asli) --
// dipakai endpoint yang butuh gate permission staf-lebar TANPA owner_id
// (kapabilitas lintas-baris, bukan row-scoped) sebelum operasi lanjut.
// Pola sama seperti lib/api/require-superadmin.ts (dan app/api/admin/
// reports/export/route.ts sebelum diekstrak), tapi untuk permission code
// apa pun -- bukan cuma is_superadmin().

import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";

export async function requirePermission(
  supabase: SupabaseClient,
  actionCode: string,
  message?: string,
): Promise<void> {
  const { data: allowed, error } = await supabase.rpc("has_permission", { p_action_code: actionCode });
  if (error) {
    throw error;
  }
  if (!allowed) {
    throw new ApiError("FORBIDDEN", message ?? `Anda tidak punya izin (${actionCode}) untuk operasi ini.`);
  }
}
