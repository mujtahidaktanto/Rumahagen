// app/api/admin/internal-users/[id]/deactivate/route.ts
// PUT /admin/internal-users/{id}/deactivate — API-142 (M09, STEP11-A).
// Jalan pintas semantik untuk aksi paling umum: set status='suspended'
// untuk akun staf. Sama efeknya dengan PUT /admin/internal-users/{id}
// {"status":"suspended"} -- dipisah sebagai endpoint sendiri karena Core
// menguncinya sebagai path terpisah, bukan sekadar field body.

import { withApiHandler } from "@/lib/api/handler";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

const STAFF_ROLE_CODES = ["admin", "manager", "superadmin"];

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);

  const { data: target, error: targetErr } = await supabase
    .from("users")
    .select("id, roles(code)")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (targetErr) throw targetErr;
  const targetRoles = target?.roles as { code: string } | { code: string }[] | null | undefined;
  const targetRoleCode = Array.isArray(targetRoles) ? targetRoles[0]?.code : targetRoles?.code;
  if (!target || !targetRoleCode || !STAFF_ROLE_CODES.includes(targetRoleCode)) {
    throw new ApiError("NOT_FOUND", "Internal user tidak ditemukan (bukan akun staf admin/manager/superadmin).");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ status: "suspended" })
    .eq("id", ctx.params.id)
    .select("id, role_id, status")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk menonaktifkan internal user ini.");
  }

  return { data };
});
