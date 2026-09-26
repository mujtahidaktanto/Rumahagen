// lib/agent/claim-rules.ts — aturan tampilan Klaim Proyek Agent (M06, wireframe 01-Agent/M06-Klaim-Proyek). Murni tanpa I/O (diuji). Status mengikuti CHECK agent_project_claims (0085/0127):
// pending | approved | rejected | revoked | withdrawn; transisi sah pending -> approved|rejected|withdrawn dan approved -> revoked; rejected, revoked, withdrawn adalah status AKHIR (dan UNIQUE(agent_id, project_id)
// membuat klaim ulang atas proyek yang sama tidak mungkin lewat aplikasi). Agent hanya boleh menarik klaim pending miliknya; listing dari proyek butuh klaim approved.
import type { BadgeTone } from "@/components/ui/Badge";
import { PROPERTY_TYPE_LABEL } from "@/lib/public/listing-params";

export const CLAIM_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Menunggu peninjauan", tone: "warning" },
  approved: { label: "Disetujui", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
  revoked: { label: "Dicabut", tone: "danger" },
  withdrawn: { label: "Ditarik", tone: "neutral" },
};
export const claimStatus = (s: string) => CLAIM_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };

export const canWithdraw = (status: string) => status === "pending";
export const canOpenApprovalPdf = (status: string) => status === "approved";
/** Listing dari proyek: klaim approved dan belum ada listing dari proyek itu (mencegah draf ganda; API sendiri tidak menolak pembuatan berulang). */
export const canCreateListing = (status: string, hasListing: boolean) => status === "approved" && !hasListing;

export const approvalPdfHref = (claimId: string) => `/api/claims/${claimId}/approval-pdf`;

const CATEGORY: Record<string, string> = { primary: "Primary", secondary: "Secondary" };
export function projectKindLabel(category: string | null, propertyType: string | null): string {
  const c = category ? (CATEGORY[category] ?? category) : "";
  const p = propertyType ? ((PROPERTY_TYPE_LABEL as Record<string, string>)[propertyType] ?? propertyType) : "";
  return [c, p].filter(Boolean).join(" · ");
}

/** Jenis berkas marketing kit (CHECK marketing_kit.file_type). */
export const KIT_TYPE_LABEL: Record<string, string> = { brochure: "Brosur", price_list: "Daftar Harga" };
export const kitTypeLabel = (t: string) => KIT_TYPE_LABEL[t] ?? t;

/** Tautan unduhan kit hanya diikuti bila https (URL bertanda tangan storage atau tautan luar developer); selain itu tanpa tombol unduh. */
export function safeKitUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Nomor WhatsApp untuk listing: wajib, 1-20 karakter, angka/+/-/spasi/kurung (API hanya membatasi 1-20 karakter). */
export function validateWhatsapp(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Nomor WhatsApp wajib diisi.";
  if (v.length > 20 || !/^[0-9+\-\s()]{6,20}$/.test(v)) return "Isi nomor WhatsApp 6-20 karakter (angka, +, -, spasi).";
  return null;
}
