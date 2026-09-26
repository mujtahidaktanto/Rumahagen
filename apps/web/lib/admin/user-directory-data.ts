// lib/admin/user-directory-data.ts — data Direktori Pengguna (M09): SEMUA pengguna (sesuai wireframe M09-Direktori-Pengguna — baris staf admin/manager juga tampil di sini untuk Superadmin/
// Admin, bukan cuma agent/mitra; Staf Internal adalah layar terpisah khusus CRUD akun staf, bukan satu-satunya tempat baris staf terlihat). TIDAK ada filter role_id di query ini dengan
// sengaja — RLS users_select_self_or_admin (0007) memberi Superadmin/Admin akses semua baris, sedangkan users_select_manager_agent_rows (0121/0122) otomatis MEMPERSEMPIT hasil Manager ke
// baris agent/instructor/buyer/developer_partner tanpa perlu filter eksplisit di sini (baris staf lain benar-benar tidak "ada" secara query untuk Manager). Nama mengikuti urutan resolusi
// yang sama dengan lib/auth/session.ts: agent_profiles.full_name -> user_metadata.full_name/name -> bagian depan email. agent_kyc dipakai untuk badge "KTP terverifikasi" (baris ada =
// terverifikasi, migration 0149 auto-verify tanpa tinjauan).
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";
import type { UserStatus } from "@/lib/admin/admin-rules";

export type DirectoryUserRow = {
  id: string;
  name: string;
  email: string | null;
  roleCode: string;
  status: UserStatus;
  createdAt: string;
  ktpVerified: boolean;
};

export async function getUserDirectory(): Promise<Part<DirectoryUserRow[]>> {
  const supabase = await createClient();

  const { data: allRoles, error: rolesErr } = await supabase.from("roles").select("id, code");
  if (rolesErr) return { ok: false };

  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id, role_id, status, created_at")
    .order("created_at", { ascending: false })
    .returns<{ id: string; role_id: string; status: UserStatus; created_at: string }[]>();
  if (usersErr) return { ok: false };

  const roleById = new Map((allRoles ?? []).map((r) => [r.id, r.code]));
  const userIds = (users ?? []).map((u) => u.id);
  if (userIds.length === 0) return { ok: true, data: [] };

  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", userIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const { data: kyc, error: kycErr } = await supabase.from("agent_kyc").select("user_id").in("user_id", userIds);
  if (kycErr) return { ok: false };
  const kycSet = new Set((kyc ?? []).map((k) => k.user_id));

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const authById = new Map(authList.users.map((u) => [u.id, u]));

  return {
    ok: true,
    data: (users ?? []).map((u) => {
      const authUser = authById.get(u.id);
      const meta = (authUser?.user_metadata ?? {}) as { full_name?: unknown; name?: unknown };
      const metaName = [meta.full_name, meta.name].find((v): v is string => typeof v === "string" && v.trim() !== "")?.trim();
      const email = authUser?.email ?? null;
      const fallbackName = metaName ?? (email ? email.split("@")[0]! : u.id.slice(0, 8));
      return {
        id: u.id,
        name: nameByUser.get(u.id)?.trim() || fallbackName,
        email,
        roleCode: roleById.get(u.role_id) ?? "",
        status: u.status,
        createdAt: u.created_at,
        ktpVerified: kycSet.has(u.id),
      };
    }),
  };
}
