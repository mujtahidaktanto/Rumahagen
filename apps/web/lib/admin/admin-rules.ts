// lib/admin/admin-rules.ts — aturan murni Fase 5 kelompok 1 (M09 Direktori Pengguna/Staf Internal/Audit & Oversight, M10 Matriks Izin). Kunci Record status persis nilai CHECK constraint
// users.status (0002) dan permission_presets/role_permissions.granted_scope (0006/0007) — jangan menambah nilai yang tidak ada di constraint.
import type { BadgeTone } from "@/components/ui/Badge";
import type { RoleCode } from "@/lib/auth/roles";

export type UserStatus = "pending_review" | "active" | "suspended" | "rejected";
export type InternalUserStatus = "active" | "suspended";
export type GrantedScope = "all" | "own" | "none";
export type AdminViewerRole = "superadmin" | "admin" | "manager";

export const USER_STATUS_TONE: Record<UserStatus, BadgeTone> = {
  pending_review: "warning",
  active: "success",
  suspended: "danger",
  rejected: "danger",
};

export const USER_STATUS_FILTER_LABEL: Record<UserStatus, string> = {
  active: "Aktif",
  pending_review: "Ditinjau",
  suspended: "Suspended",
  rejected: "Ditolak",
};

export const INTERNAL_STATUS_LABEL: Record<InternalUserStatus, string> = { active: "Aktif", suspended: "Nonaktif" };
export const INTERNAL_STATUS_TONE: Record<InternalUserStatus, BadgeTone> = { active: "success", suspended: "danger" };

/** Role yang TETAP terlihat oleh Manager di Direktori Pengguna (RLS users_select_manager_agent_rows, 0121/0122) — Superadmin/Admin melihat SEMUA role termasuk staf (users_select_self_or_admin, 0007);
 * Staf Internal tetap ada terpisah karena satu-satunya tempat membuat/menonaktifkan akun staf. */
export const DIRECTORY_ROLE_CODES = ["agent", "instructor", "buyer", "developer_partner"] as const;
/** Role yang boleh dikonversi lewat "Ubah Role" di Direktori Pengguna oleh Superadmin (mitra + staf sekaligus — operasi paling sensitif). */
export const ALL_ROLE_OPTIONS: RoleCode[] = ["agent", "instructor", "buyer", "developer_partner", "manager", "admin", "superadmin"];
/** Manager hanya boleh mengonversi akun 'agent' menjadi salah satu ini (onboarding mitra baru, migration 0120) — tidak bisa membalik arah. */
export const PARTNER_ROLE_OPTIONS: RoleCode[] = ["instructor", "buyer", "developer_partner"];
/** Role staf yang bisa dibuat/diubah di Staf Internal (Superadmin-only untuk semuanya). */
export const STAFF_ROLE_OPTIONS: RoleCode[] = ["admin", "manager", "superadmin"];

/** RLS users_select_manager_agent_rows (0121, diperluas 0122): Manager hanya melihat baris agent/instructor/buyer/developer_partner — baris staf lain tidak "terlihat" di DB sama sekali. */
export function isRowVisibleToManager(roleCode: string): boolean {
  return (DIRECTORY_ROLE_CODES as readonly string[]).includes(roleCode);
}

/** KTP dan Suspend (Direktori Pengguna) hanya untuk target role 'agent', oleh Superadmin/Admin (RLS users_update_admin 0104 + agent_kyc_select 0149; suspend juga Superadmin+Admin, migration 0108). */
export function canManageAgentActions(viewerRole: AdminViewerRole): boolean {
  return viewerRole === "superadmin" || viewerRole === "admin";
}

/** "Ubah Role" di Direktori Pengguna: Superadmin ke role mana pun (RLS users_update_admin, 0104); Manager hanya untuk baris yang SAAT INI 'agent' (migration 0120, onboarding mitra). Admin tidak bisa sama sekali. */
export function canChangeUserRole(viewerRole: AdminViewerRole, targetRoleCode: string): boolean {
  if (viewerRole === "superadmin") return true;
  if (viewerRole === "manager") return targetRoleCode === "agent";
  return false;
}

export function roleOptionsForChangeRole(viewerRole: AdminViewerRole): RoleCode[] {
  return viewerRole === "superadmin" ? ALL_ROLE_OPTIONS : PARTNER_ROLE_OPTIONS;
}

/** Matriks Izin baris baseline: Superadmin bisa ubah semua kolom; Manager hanya kolom Agent (role_permissions_manager_modify_agent_rows, 0103); Admin view-only. */
export function canEditMatrixColumn(viewerRole: AdminViewerRole, columnRoleCode: string): boolean {
  if (viewerRole === "superadmin") return true;
  if (viewerRole === "manager") return columnRoleCode === "agent";
  return false;
}

/** Preset (Matriks Izin tab Preset): Superadmin ALL role target + Manager (Agent-only) bisa kelola; Admin view-only (permission_presets_manage 0007, permission_presets_select_view 0103). */
export function canManagePreset(viewerRole: AdminViewerRole): boolean {
  return viewerRole === "superadmin" || viewerRole === "manager";
}

/** Hanya Superadmin yang boleh memilih target role preset selain Agent (trigger enforce_preset_target_role_is_agent, 0004/0102) — Manager selalu terkunci ke Agent. */
export function canPickPresetTargetRole(viewerRole: AdminViewerRole): boolean {
  return viewerRole === "superadmin";
}

export function grantedScopeLabel(scope: string): string {
  return scope === "all" ? "ALL" : scope === "own" ? "OWN" : "NONE";
}

export type CreateStaffForm = { email: string; password: string; roleCode: RoleCode };
export type CreateStaffErrors = Partial<Record<"email" | "password", string>>;

export function validateCreateStaff(f: CreateStaffForm): CreateStaffErrors {
  const errors: CreateStaffErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "Email tidak valid.";
  if (f.password.trim().length < 8) errors.password = "Kata sandi minimal 8 karakter.";
  return errors;
}
