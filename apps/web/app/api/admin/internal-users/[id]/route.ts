// app/api/admin/internal-users/[id]/route.ts
// PUT /admin/internal-users/{id} — API-141 (M09, STEP11-A). Update
// role_id/status untuk akun staf yang SUDAH ada. Route ini sengaja hanya
// menerima target yang SAAT INI staf (admin/manager/superadmin) --
// mengubah role/status user platform biasa lewat sini ditolak, arahkan ke
// PUT /admin/users/{id}/role (generik, sudah ada) supaya batas semantik
// "internal user management" vs "user management umum" tetap jelas.
//
// Superadmin-only lewat requireSuperadmin() (bukan cuma RLS
// users_update_admin, 0104) karena route ini JUGA memvalidasi status staf
// sebelum menulis -- pengecekan eksplisit di sini konsisten dengan
// app/api/admin/internal-users/route.ts.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateInternalUserSchema } from "@/lib/validation/admin";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

const STAFF_ROLE_CODES = ["admin", "manager", "superadmin"];

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const body = await validateJsonBody(ctx.request, updateInternalUserSchema);

  const { data: target, error: targetErr } = await supabase
    .from("users")
    .select("id, role_id, roles(code)")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (targetErr) throw targetErr;
  const targetRoles = target?.roles as { code: string } | { code: string }[] | null | undefined;
  const targetRoleCode = Array.isArray(targetRoles) ? targetRoles[0]?.code : targetRoles?.code;
  if (!target || !targetRoleCode || !STAFF_ROLE_CODES.includes(targetRoleCode)) {
    throw new ApiError("NOT_FOUND", "Internal user tidak ditemukan (bukan akun staf admin/manager/superadmin).");
  }

  if (body.role_id) {
    const { data: newRole, error: newRoleErr } = await supabase.from("roles").select("code").eq("id", body.role_id).maybeSingle();
    if (newRoleErr) throw newRoleErr;
    if (!newRole || !STAFF_ROLE_CODES.includes(newRole.code)) {
      throw new ApiError("VALIDATION_ERROR", "role_id harus salah satu dari admin/manager/superadmin.");
    }
  }

  const { data, error } = await supabase
    .from("users")
    .update({ ...(body.role_id ? { role_id: body.role_id } : {}), ...(body.status ? { status: body.status } : {}) })
    .eq("id", ctx.params.id)
    .select("id, role_id, status")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah internal user ini.");
  }

  return { data };
});
