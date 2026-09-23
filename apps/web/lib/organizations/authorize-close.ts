// lib/organizations/authorize-close.ts
// Cek otorisasi "siapa boleh menutup Organisasi ini" -- dipakai di 3 route
// (Close, request OTP, confirm OTP) yang harus menggerbangi ketiganya
// dengan aturan IDENTIK (R-02: satu sumber, bukan diulang beda-beda per
// route). Dipisah eksplisit dari RLS organizations_manage supaya pemanggil
// TANPA hak dapat 403 yang jelas, bukan NOT_FOUND/CONFLICT yang ambigu
// (lihat komentar asli di app/api/organizations/[id]/route.ts).

import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";

export async function assertCanCloseOrganization(
  supabase: SupabaseClient,
  org: { created_by: string },
  callerId: string | null,
): Promise<void> {
  if (org.created_by === callerId) return;

  const { data: isSuperadmin, error: saErr } = await supabase.rpc("is_superadmin");
  if (saErr) throw saErr;
  if (isSuperadmin) return;

  const { data: roleCode, error: roleErr } = await supabase.rpc("current_role_code");
  if (roleErr) throw roleErr;
  if (roleCode === "admin") return;

  throw new ApiError("FORBIDDEN", "Hanya pembuat organisasi (leader) atau Superadmin/Admin yang bisa menutup organisasi ini.");
}
