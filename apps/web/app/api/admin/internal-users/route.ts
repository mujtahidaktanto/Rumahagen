// app/api/admin/internal-users/route.ts
// GET/POST /admin/internal-users — API-139/140 (M09, STEP11-A). "Internal
// user" = akun staf (role admin/manager/superadmin) yang mengoperasikan
// admin console, dibedakan dari actor platform (agent/buyer/developer_
// partner/instructor) yang punya jalur pendaftaran sendiri lewat M01
// (/auth/register). Tidak ada skema/field apa pun dievidensi Core untuk
// resource ini selain nama endpoint — lihat lib/validation/admin.ts untuk
// alasan desain lengkap.
//
// Superadmin-only untuk KEDUANYA (GET dan POST) — dicek eksplisit lewat
// requireSuperadmin(), BUKAN RLS tabel tunggal, karena route ini memanggil
// Supabase Admin API (auth.admin.createUser/listUsers) yang tidak
// tercakup RLS Postgres sama sekali. Membuat/melihat daftar staf adalah
// kapabilitas paling sensitif di seluruh admin console -- konsisten
// dengan preseden system_configuration/PUT admin/users/{id}/role yang
// juga Superadmin-only.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createInternalUserSchema } from "@/lib/validation/admin";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STAFF_ROLE_CODES = ["admin", "manager", "superadmin"];

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const { data: staffRoles, error: rolesErr } = await supabase.from("roles").select("id, code").in("code", STAFF_ROLE_CODES);
  if (rolesErr) throw rolesErr;

  const { data: staffUsers, error: usersErr } = await supabase
    .from("users")
    .select("id, role_id, status, created_at, last_login_at")
    .in("role_id", (staffRoles ?? []).map((r) => r.id))
    .order("created_at", { ascending: false });
  if (usersErr) throw usersErr;

  const roleById = new Map((staffRoles ?? []).map((r) => [r.id, r.code]));

  // Email HANYA ada di auth.users (bukan public.users) -- diambil lewat
  // Supabase Admin API. perPage besar sebagai pengaman praktis (bukan
  // aturan bisnis) untuk jumlah staf yang wajar; bukan cakupan tak
  // terbatas kalau jumlah staf sudah sangat besar.
  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) throw authErr;
  const emailById = new Map(authList.users.map((u) => [u.id, u.email]));

  const data = (staffUsers ?? []).map((u) => ({
    id: u.id,
    email: emailById.get(u.id) ?? null,
    role_code: roleById.get(u.role_id) ?? null,
    status: u.status,
    created_at: u.created_at,
    last_login_at: u.last_login_at,
  }));

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const body = await validateJsonBody(ctx.request, createInternalUserSchema);

  const { data: role, error: roleErr } = await supabase.from("roles").select("code").eq("id", body.role_id).maybeSingle();
  if (roleErr) throw roleErr;
  if (!role || !STAFF_ROLE_CODES.includes(role.code)) {
    throw new ApiError("VALIDATION_ERROR", "role_id harus salah satu dari admin/manager/superadmin untuk internal user.");
  }

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });
  if (createErr) {
    if (createErr.message?.toLowerCase().includes("already registered") || createErr.code === "email_exists") {
      throw new ApiError("CONFLICT", "Email sudah terdaftar.");
    }
    throw createErr;
  }

  // Trigger handle_auth_user_sync (0096) sudah membuat baris public.users
  // dengan role default 'agent' -- ditimpa eksplisit ke role staf yang
  // diminta. Dipanggil lewat admin client (bukan client bersesi) karena
  // trigger enforce_users_protected_columns (0100/0101) mengizinkan
  // is_superadmin() ATAU auth.uid() IS NULL -- admin client selalu
  // auth.uid() NULL, konsisten dengan pola akses service-role lain di
  // proyek ini.
  const { data: updatedUser, error: updateErr } = await admin
    .from("users")
    .update({ role_id: body.role_id })
    .eq("id", created.user.id)
    .select("id, role_id, status")
    .maybeSingle();
  if (updateErr) throw updateErr;

  return {
    data: { id: created.user.id, email: created.user.email, role_id: updatedUser?.role_id, status: updatedUser?.status },
    status: 201,
  };
});
