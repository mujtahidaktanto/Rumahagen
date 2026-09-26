// lib/admin/staff-data.ts — data Staf Internal (M09): akun staf (role admin/manager/superadmin). Superadmin-only untuk baca maupun tulis (requireSuperadmin() di route, bukan cuma RLS — route
// GET/POST /admin/internal-users memanggil Supabase Admin API karena email hanya ada di auth.users, bukan public.users). Pola sama seperti route itu: client bersesi untuk baris users (RLS
// tetap berlaku sebagai lapis pertama), admin client HANYA untuk resolusi email — dipanggil di sini (bukan lewat fetch ke /api/* sendiri) mengikuti pola lib/agent/*-data.ts lainnya, dengan
// pengecekan is_superadmin() eksplisit sebelum memanggil admin client (STEP komentar lib/supabase/admin.ts: bypass RLS bukan berarti bypass otorisasi).
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";

const STAFF_ROLE_CODES = ["admin", "manager", "superadmin"];

export type StaffRow = {
  id: string;
  email: string | null;
  roleCode: string;
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
};

export async function getStaffDirectory(): Promise<Part<StaffRow[]>> {
  const supabase = await createClient();
  const { data: isSuperadmin, error: saErr } = await supabase.rpc("is_superadmin");
  if (saErr || !isSuperadmin) return { ok: false };

  const { data: staffRoles, error: rolesErr } = await supabase.from("roles").select("id, code").in("code", STAFF_ROLE_CODES);
  if (rolesErr) return { ok: false };

  const { data: staffUsers, error: usersErr } = await supabase
    .from("users")
    .select("id, role_id, status, created_at, last_login_at")
    .in("role_id", (staffRoles ?? []).map((r) => r.id))
    .order("created_at", { ascending: false })
    .returns<{ id: string; role_id: string; status: "active" | "suspended"; created_at: string; last_login_at: string | null }[]>();
  if (usersErr) return { ok: false };

  const roleById = new Map((staffRoles ?? []).map((r) => [r.id, r.code]));

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const emailById = new Map(authList.users.map((u) => [u.id, u.email ?? null]));

  return {
    ok: true,
    data: (staffUsers ?? []).map((u) => ({
      id: u.id,
      email: emailById.get(u.id) ?? null,
      roleCode: roleById.get(u.role_id) ?? "",
      status: u.status,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
    })),
  };
}
