// lib/agent/org-rules.ts — aturan murni layar Organisasi Agent (M12 Dashboard, Buat Organisasi, Kelola Anggota): label dan nada (nilai CHECK apa adanya), validasi formulir, badan API, keadaan undangan,
// dan izin aksi menurut peran. Tanpa I/O agar bisa dipakai komponen klien dan diuji. Batas mengikuti createOrganizationSchema / updateOrganizationBrandingSchema; server penentu akhir.
import type { BadgeTone } from "@/components/ui/Badge";
import { isHttpsUrl } from "@/lib/agent/listing-wizard";
import { ORG_TYPES, ORG_TYPE_LABEL } from "@/lib/public/organization-labels";

export { ORG_TYPES, ORG_TYPE_LABEL };

export const ROLE_LABEL: Record<string, string> = { leader: "Leader", member: "Member" };
export const ROLE_TONE: Record<string, BadgeTone> = { leader: "info", member: "neutral" };

// ── Status organisasi ──
export type OrgBanner = { tone: "warning" | "neutral" | "danger"; title: string; text: string };

/** Spanduk status organisasi (active = tanpa spanduk). suspended = penegakan staf: tidak ada aksi untuk leader. */
export function orgBanner(status: string, isLeader: boolean): OrgBanner | null {
  if (status === "closing")
    return {
      tone: "warning",
      title: "Organisasi Sedang Dalam Proses Penutupan",
      text: isLeader
        ? "Anggota masih bisa melihat organisasi ini, tetapi tidak bisa menerima anggota atau listing baru. Konfirmasi untuk menyelesaikan penutupan permanen."
        : "Anggota masih bisa melihat organisasi ini, tetapi tidak bisa menerima anggota atau listing baru. Leader perlu mengonfirmasi penutupan permanen.",
    };
  if (status === "closed") return { tone: "neutral", title: "Organisasi Sudah Ditutup", text: "Organisasi ini sudah ditutup secara permanen. Tidak ada aksi lebih lanjut yang tersedia." };
  if (status === "suspended")
    return { tone: "danger", title: "Organisasi Dibekukan Tim RumahAgen", text: "Aktivitas organisasi ini dihentikan sementara oleh admin platform. Anggota tidak bisa mengelola organisasi sampai pembekuan dicabut." };
  return null;
}

export const canManageOrg = (role: string, status: string) => role === "leader" && status === "active";
export const canInviteMembers = canManageOrg;
/** Leader boleh mengeluarkan anggota lain (bukan dirinya, bukan sesama leader) selama organisasi aktif. */
export const canRemoveMember = (viewerRole: string, status: string, m: { role: string; isSelf: boolean }) => viewerRole === "leader" && status === "active" && m.role !== "leader" && !m.isSelf;
export const canLeaveOrg = (role: string, status: string) => role === "member" && status !== "closed";

/** Langkah penutupan yang tersedia: active -> "close" (tanpa OTP), closing -> "confirm" (OTP), selain itu tidak ada. */
export function closeStep(status: string, isLeader: boolean): "close" | "confirm" | null {
  if (!isLeader) return null;
  return status === "active" ? "close" : status === "closing" ? "confirm" : null;
}

export const cleanOtp = (raw: string) => raw.replace(/\D/g, "").slice(0, 8);
export const isOtpShape = (s: string) => /^[0-9]{6,8}$/.test(s);

// ── Undangan ──
/** "Berlaku sampai 30 Sep 2026" / "Kedaluwarsa" / "" (tanpa batas). */
export function inviteExpiryText(expiresAt: string | null, isExpired: boolean, formatDate: (iso: string) => string): string {
  if (isExpired) return "Kedaluwarsa";
  return expiresAt ? `Berlaku sampai ${formatDate(expiresAt)}` : "";
}

// ── Formulir Buat Organisasi ──
export type OrgFormValues = {
  name: string;
  type: string;
  address: string;
  phone: string;
  description: string;
  website: string;
  instagram: string;
};
export const EMPTY_ORG: OrgFormValues = { name: "", type: "", address: "", phone: "", description: "", website: "", instagram: "" };
export type OrgFormErrors = Partial<Record<keyof OrgFormValues, string>>;

const PHONE = /^[0-9+()\-\s]{6,20}$/;
const INSTAGRAM = /^@?[A-Za-z0-9._]{1,30}$/;

export function validateOrgForm(v: OrgFormValues): OrgFormErrors {
  const e: OrgFormErrors = {};
  const name = v.name.trim();
  if (!name) e.name = "Nama organisasi wajib diisi.";
  else if (name.length > 150) e.name = "Maksimal 150 karakter.";
  if (!(ORG_TYPES as readonly string[]).includes(v.type)) e.type = "Pilih jenis organisasi.";
  const addr = v.address.trim();
  if (!addr) e.address = "Alamat wajib diisi.";
  else if (addr.length > 500) e.address = "Maksimal 500 karakter.";
  const ph = v.phone.trim();
  if (!ph) e.phone = "Nomor telepon kantor wajib diisi.";
  else if (!PHONE.test(ph)) e.phone = "Nomor telepon tidak valid (maks 20 karakter, contoh (021) 5551234).";
  e.website = undefined;
  if (v.website.trim()) {
    if (!isHttpsUrl(v.website.trim())) e.website = "Tautan harus diawali https://.";
    else if (v.website.trim().length > 255) e.website = "Maksimal 255 karakter.";
  }
  if (!e.website) delete e.website;
  if (v.instagram.trim() && !INSTAGRAM.test(v.instagram.trim())) e.instagram = "Gunakan nama akun Instagram, mis. @namaorganisasi.";
  return e;
}

const normHandle = (s: string) => {
  const t = s.trim();
  return t ? (t.startsWith("@") ? t : `@${t}`) : "";
};

/** Badan POST /organizations. Bidang opsional kosong tidak dikirim. Nama, jenis, alamat, dan telepon terkunci permanen setelah dibuat. */
export function toCreateOrgPayload(v: OrgFormValues): Record<string, unknown> {
  const ig = normHandle(v.instagram);
  return {
    organization_name: v.name.trim(),
    organization_type: v.type,
    address: v.address.trim(),
    contact_phone: v.phone.trim(),
    ...(v.description.trim() ? { description: v.description.trim() } : {}),
    ...(v.website.trim() ? { website: v.website.trim() } : {}),
    ...(ig ? { social_media: { instagram: ig } } : {}),
  };
}

// ── Branding (bisa diubah kapan saja) ──
export type BrandingValues = { description: string; website: string; instagram: string };
export type BrandingErrors = Partial<Record<keyof BrandingValues, string>>;

export function validateBranding(v: BrandingValues): BrandingErrors {
  const e: BrandingErrors = {};
  if (v.website.trim()) {
    if (!isHttpsUrl(v.website.trim())) e.website = "Tautan harus diawali https://.";
    else if (v.website.trim().length > 255) e.website = "Maksimal 255 karakter.";
  }
  if (v.instagram.trim() && !INSTAGRAM.test(v.instagram.trim())) e.instagram = "Gunakan nama akun Instagram, mis. @namaorganisasi.";
  return e;
}

/** Badan PUT /organizations/{id}/branding: kosong = null (dihapus). Bidang sosial media lain yang sudah ada dipertahankan. */
export function toBrandingPayload(v: BrandingValues, existingSocial: Record<string, unknown> | null): Record<string, unknown> {
  const social: Record<string, string> = {};
  for (const [k, val] of Object.entries(existingSocial ?? {})) if (typeof val === "string" && k !== "instagram") social[k] = val;
  const ig = normHandle(v.instagram);
  if (ig) social.instagram = ig;
  return {
    description: v.description.trim() || null,
    website: v.website.trim() || null,
    social_media: Object.keys(social).length ? social : null,
  };
}

export function instagramOf(social: Record<string, unknown> | null | undefined): string {
  const v = social?.instagram;
  return typeof v === "string" ? v : "";
}
