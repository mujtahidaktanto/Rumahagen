// components/admin/PermissionMatrixView.tsx — Matriks Izin (M10, wireframe 02-Admin/M10-Matriks-Izin): tab Matriks Baseline (role_permissions, sel diedit langsung) dan tab Preset. Tab lewat
// query string (?tab=baseline|preset), murni server-rendered kecuali sel editor (MatrixCellEditor), pemilih role target (TargetRoleSelect), dan panel preset (PermissionPresetPanel).
import Link from "next/link";
import type { Route } from "next";
import { MatrixCellEditor } from "@/components/admin/MatrixCellEditor";
import { PermissionPresetPanel } from "@/components/admin/PermissionPresetPanel";
import { PRESET_TARGET_ROLE_OPTIONS, TargetRoleSelect } from "@/components/admin/TargetRoleSelect";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { canEditMatrixColumn, canManagePreset, type AdminViewerRole } from "@/lib/admin/admin-rules";
import { permissionCatalogFrom, type MatrixRow } from "@/lib/admin/permission-matrix-data";
import type { PresetAssignCandidate, PresetRow } from "@/lib/admin/permission-preset-data";
import type { Part } from "@/lib/agent/dashboard-data";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";

const MATRIX_COLUMNS = ["superadmin", "admin", "manager", "agent"] as const;

export function PermissionMatrixView({
  viewerRole,
  tab,
  matrixRows,
  roleIdByCode,
  targetRoleCode,
  presetData,
}: {
  viewerRole: AdminViewerRole;
  tab: "baseline" | "preset";
  matrixRows: Part<MatrixRow[]>;
  roleIdByCode: Record<string, string>;
  targetRoleCode: RoleCode;
  presetData: { presets: Part<PresetRow[]>; candidates: Part<PresetAssignCandidate[]> } | null;
}) {
  const isSuperadmin = viewerRole === "superadmin";

  return (
    <div className="flex w-full flex-col">
      <div className="p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Matriks Izin</h1>
      </div>

      <div className="flex gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={"/admin/izin?tab=baseline" as Route} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "baseline" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Matriks Baseline (Role × Permission)
        </Link>
        <Link href={"/admin/izin?tab=preset" as Route} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "preset" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Preset
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "baseline" ? (
          !matrixRows.ok ? (
            <ErrorState title="Matriks izin gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="text-body-md text-ink-500">
                Baseline default per role — bukan Preset.{" "}
                {isSuperadmin ? "Anda bisa ubah semua baris." : viewerRole === "manager" ? "Anda hanya bisa ubah kolom Agent." : "Anda hanya bisa melihat (view-only)."}
              </p>
              <Table>
                <THead>
                  <TR>
                    <TH>Permission (module.resource.action)</TH>
                    {MATRIX_COLUMNS.map((c) => (
                      <TH key={c}>{ROLE_LABEL[c]}</TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {matrixRows.data.map((row) => (
                    <TR key={row.permissionId}>
                      <TD>
                        <span className="font-mono text-[12.5px]">{row.actionCode}</span>
                      </TD>
                      {MATRIX_COLUMNS.map((c) => (
                        <TD key={c}>
                          <MatrixCellEditor roleId={roleIdByCode[c] ?? ""} permissionId={row.permissionId} initialScope={row.scopes[c]} editable={canEditMatrixColumn(viewerRole, c)} />
                        </TD>
                      ))}
                    </TR>
                  ))}
                </TBody>
              </Table>
            </>
          )
        ) : !presetData ? null : !presetData.presets.ok || !presetData.candidates.ok ? (
          <ErrorState title="Preset gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-body-md text-ink-500">
                {isSuperadmin
                  ? "Preset default menyasar role Agent — sebagai Superadmin Anda juga bisa menargetkan role lain."
                  : "Preset yang Anda kelola selalu menyasar role Agent — role lain memerlukan Superadmin."}
              </p>
            </div>
            {isSuperadmin ? (
              <div className="flex items-center gap-2.5">
                <label className="text-label-lg">Role target:</label>
                <TargetRoleSelect value={PRESET_TARGET_ROLE_OPTIONS.includes(targetRoleCode) ? targetRoleCode : "agent"} />
                <span className="text-caption">Hanya Superadmin yang bisa memilih role selain Agent — Manager selalu terkunci ke Agent.</span>
              </div>
            ) : null}
            <PermissionPresetPanel
              targetRoleId={roleIdByCode[targetRoleCode] ?? ""}
              presets={presetData.presets.data}
              candidates={presetData.candidates.data}
              permissionCatalog={matrixRows.ok ? permissionCatalogFrom(matrixRows.data) : []}
              canManagePreset={canManagePreset(viewerRole)}
            />
          </>
        )}
      </div>
    </div>
  );
}
