// lib/auth/roles.ts — kode peran (tabel roles) dan area aplikasi tiap peran. Murni (tanpa I/O) supaya bisa dipakai server, klien, dan uji.
// Peran `buyer` tidak punya area (diperlakukan sebagai pengunjung Publik/Agent: keputusan 2026-09-24).

export const ROLE_CODES = ["superadmin", "admin", "manager", "agent", "developer_partner", "instructor", "buyer"] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export function isRoleCode(value: unknown): value is RoleCode {
  return typeof value === "string" && (ROLE_CODES as readonly string[]).includes(value);
}

export type Area = "agent" | "admin" | "partner" | "instructor";

/** Awalan URL tiap area (kerangka aplikasi di app/<area>). */
export const AREA_PATH: Record<Area, string> = { agent: "/agent", admin: "/admin", partner: "/partner", instructor: "/instructor" };

/** Peran -> area. null = tidak punya area aplikasi (buyer). */
export function areaOf(role: RoleCode): Area | null {
  switch (role) {
    case "superadmin":
    case "admin":
    case "manager":
      return "admin";
    case "agent":
      return "agent";
    case "developer_partner":
      return "partner";
    case "instructor":
      return "instructor";
    default:
      return null;
  }
}

/** Halaman awal peran setelah login; buyer kembali ke beranda publik. */
export function homePathOf(role: RoleCode): string {
  const area = areaOf(role);
  return area ? AREA_PATH[area] : "/";
}

export const ROLE_LABEL: Record<RoleCode, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
  developer_partner: "Developer Partner",
  instructor: "Instruktur",
  buyer: "Pembeli",
};

/** Peran yang boleh membuka area tertentu. */
export const AREA_ROLES: Record<Area, RoleCode[]> = {
  agent: ["agent"],
  admin: ["superadmin", "admin", "manager"],
  partner: ["developer_partner"],
  instructor: ["instructor"],
};
