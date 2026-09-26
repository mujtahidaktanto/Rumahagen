// app/admin/izin/page.tsx — Matriks Izin (M10): tab lewat query string (?tab=baseline|preset&target_role=...).
import { PermissionMatrixView } from "@/components/admin/PermissionMatrixView";
import { getPermissionMatrixRows } from "@/lib/admin/permission-matrix-data";
import { getPresetAssignCandidates, getPresetsForTargetRole } from "@/lib/admin/permission-preset-data";
import { getRoleIdByCode } from "@/lib/admin/role-catalog-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";
import { isRoleCode, type RoleCode } from "@/lib/auth/roles";
import { PRESET_TARGET_ROLE_OPTIONS } from "@/components/admin/TargetRoleSelect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Matriks Izin | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminPermissionMatrixPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const viewerRole = user.role as AdminViewerRole;
  const sp = await searchParams;

  const tab: "baseline" | "preset" = one(sp.tab) === "preset" ? "preset" : "baseline";
  const requestedTargetRole = one(sp.target_role);
  const targetRoleCode: RoleCode = viewerRole === "superadmin" && requestedTargetRole && isRoleCode(requestedTargetRole) && PRESET_TARGET_ROLE_OPTIONS.includes(requestedTargetRole) ? requestedTargetRole : "agent";

  const [matrixRows, roleIdByCode] = await Promise.all([getPermissionMatrixRows(), getRoleIdByCode()]);

  let presetData = null;
  if (tab === "preset") {
    const targetRoleId = roleIdByCode[targetRoleCode];
    presetData = targetRoleId
      ? { presets: await getPresetsForTargetRole(targetRoleId), candidates: await getPresetAssignCandidates(targetRoleId) }
      : { presets: { ok: false as const }, candidates: { ok: false as const } };
  }

  return <PermissionMatrixView viewerRole={viewerRole} tab={tab} matrixRows={matrixRows} roleIdByCode={roleIdByCode} targetRoleCode={targetRoleCode} presetData={presetData} />;
}
