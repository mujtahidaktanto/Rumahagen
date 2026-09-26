// lib/admin/role-catalog-data.ts — peta code<->id tabel roles, dipakai layar admin mana pun yang perlu role_id untuk PUT (Staf Internal, Direktori Pengguna, Matriks Izin). RLS roles_select
// (m10.role_catalogue.view) mengizinkan superadmin/admin/manager membaca seluruh katalog (scope 'all', seed 0009).
import { createClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/lib/auth/roles";

export async function getRoleIdByCode(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("id, code").returns<{ id: string; code: RoleCode }[]>();
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [r.code, r.id]));
}
