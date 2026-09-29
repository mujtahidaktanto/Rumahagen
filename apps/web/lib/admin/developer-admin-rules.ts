// lib/admin/developer-admin-rules.ts — aturan murni Proyek Developer (M06, wireframe 02-Admin/M06-Developer-Project-Admin). Status persis CHECK constraint developer_projects.status (migration
// 0034) dan developer_partners.status (0033) — jangan menambah nilai yang tidak ada di constraint.
import type { BadgeTone } from "@/components/ui/Badge";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import type { PartnerRow } from "@/lib/admin/developer-admin-data";

export const PROJECT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  coming_soon: { label: "Coming Soon", tone: "info" },
  sold_out: { label: "Sold Out", tone: "neutral" },
  inactive: { label: "Inactive", tone: "danger" },
};
export const projectStatus = (s: string) => PROJECT_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };
export const PROJECT_STATUS_OPTIONS = ["coming_soon", "active", "sold_out", "inactive"] as const;

export const PARTNER_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
};
export const partnerStatus = (s: string) => PARTNER_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };

export const CATEGORY_LABEL: Record<string, string> = { primary: "Primary", secondary: "Secondary" };
export const TRANSACTION_LABEL: Record<string, string> = { sale: "Dijual", rent: "Disewakan" };

/** Akun ber-role Developer Partner yang belum terhubung ke perusahaan mana pun — untuk pemilih "Hubungkan Akun". */
export function unlinkedDeveloperPartnerUsers(users: DirectoryUserRow[], partners: PartnerRow[]): DirectoryUserRow[] {
  const linked = new Set(partners.map((p) => p.userId).filter((v): v is string => !!v));
  return users.filter((u) => u.roleCode === "developer_partner" && !linked.has(u.id));
}
