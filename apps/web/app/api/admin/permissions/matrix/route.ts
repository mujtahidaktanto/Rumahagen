// app/api/admin/permissions/matrix/route.ts
// GET/PUT /admin/permissions/matrix — API-144/API-146 (M10, STEP11-A).
// Matrix baseline role×permission (`role_permissions`, sudah ada sejak
// 0006/0007). GET dikelompokkan per role supaya mudah dirender sebagai
// grid. Otorisasi murni lewat RLS (R-02) — role_permissions_select
// (Superadmin/Admin/Manager=ALL view, 0007) dan dua policy WRITE yang
// saling melengkapi: role_permissions_manage_superadmin (Superadmin,
// semua baris) + role_permissions_manager_modify_agent_rows (Manager,
// HANYA baris role Agent — diperbaiki di 0103, sebelumnya diam-diam tidak
// pernah berfungsi).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { permissionMatrixCellUpdateSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("role_id, permission_id, granted_scope, roles(code, name), permissions(action_code, module_code, description)")
    .order("role_id");

  if (error) {
    throw error;
  }

  const grouped = new Map<string, { role_id: string; role_code: string; role_name: string; permissions: unknown[] }>();
  for (const row of data ?? []) {
    const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
    const permission = Array.isArray(row.permissions) ? row.permissions[0] : row.permissions;
    if (!grouped.has(row.role_id)) {
      grouped.set(row.role_id, {
        role_id: row.role_id,
        role_code: role?.code ?? "",
        role_name: role?.name ?? "",
        permissions: [],
      });
    }
    grouped.get(row.role_id)!.permissions.push({
      permission_id: row.permission_id,
      action_code: permission?.action_code,
      module_code: permission?.module_code,
      granted_scope: row.granted_scope,
    });
  }

  return { data: Array.from(grouped.values()) };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, permissionMatrixCellUpdateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_permissions")
    .update({ granted_scope: body.granted_scope, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq("role_id", body.role_id)
    .eq("permission_id", body.permission_id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError(
      "FORBIDDEN",
      "Anda tidak punya akses untuk mengubah sel ini, atau kombinasi role_id/permission_id tidak ditemukan.",
    );
  }

  return { data };
});
