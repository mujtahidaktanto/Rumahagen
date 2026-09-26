// lib/admin/permission-matrix-data.ts — Matriks Baseline (M10, wireframe M10-Matriks-Izin tab 1): role_permissions (0006/0007) dipivot dari grouped-by-role (pola sama seperti GET
// /admin/permissions/matrix, API-144) menjadi satu baris per permission x 4 kolom role (Superadmin/Admin/Manager/Agent — role lain seperti instructor/buyer/developer_partner TIDAK bagian
// dari layar ini, sesuai wireframe). ~80 baris (representatif di wireframe, bukan daftar lengkap — dikonfirmasi query live DB). RLS role_permissions_select (0007) mengizinkan ketiga
// viewer melihat semua baris; WRITE dibatasi terpisah lewat admin-rules.canEditMatrixColumn (Superadmin semua kolom, Manager hanya kolom Agent, Admin view-only).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import type { GrantedScope } from "@/lib/admin/admin-rules";

const MATRIX_ROLE_CODES = ["superadmin", "admin", "manager", "agent"] as const;
type MatrixRoleCode = (typeof MATRIX_ROLE_CODES)[number];

export type MatrixRow = {
  permissionId: string;
  actionCode: string;
  moduleCode: string;
  scopes: Record<MatrixRoleCode, GrantedScope>;
};

export async function getPermissionMatrixRows(): Promise<Part<MatrixRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("role_id, permission_id, granted_scope, roles(code), permissions(action_code, module_code)")
    .returns<{ role_id: string; permission_id: string; granted_scope: GrantedScope; roles: { code: string } | null; permissions: { action_code: string; module_code: string } | null }[]>();
  if (error) return { ok: false };

  const byPermission = new Map<string, MatrixRow>();
  for (const row of data ?? []) {
    const roleCode = row.roles?.code;
    if (!roleCode || !(MATRIX_ROLE_CODES as readonly string[]).includes(roleCode) || !row.permissions) continue;
    if (!byPermission.has(row.permission_id)) {
      byPermission.set(row.permission_id, {
        permissionId: row.permission_id,
        actionCode: row.permissions.action_code,
        moduleCode: row.permissions.module_code,
        scopes: { superadmin: "none", admin: "none", manager: "none", agent: "none" },
      });
    }
    byPermission.get(row.permission_id)!.scopes[roleCode as MatrixRoleCode] = row.granted_scope;
  }

  return { ok: true, data: [...byPermission.values()].sort((a, b) => a.actionCode.localeCompare(b.actionCode)) };
}

export type PermissionCatalogItem = { permissionId: string; actionCode: string };

/** Katalog lengkap izin (untuk pemilih item preset) — diturunkan dari baris matriks yang sama, tidak query terpisah. */
export function permissionCatalogFrom(rows: MatrixRow[]): PermissionCatalogItem[] {
  return rows.map((r) => ({ permissionId: r.permissionId, actionCode: r.actionCode }));
}
