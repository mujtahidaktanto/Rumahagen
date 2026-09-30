// lib/admin/static-content-rules.ts — aturan murni Konten Publik (M11, wireframe 02-Admin/M09-Form-Konten-Publik): label status persis CHECK constraint static_public_content.status
// (migration 0037, siklus Draft→Diterbitkan→Tidak diterbitkan→Diarsipkan) dan validasi form.
import type { BadgeTone } from "@/components/ui/Badge";

export const STATIC_CONTENT_STATUS: Record<string, { label: string; tone: BadgeTone; hint: string }> = {
  draft: { label: "Draf", tone: "neutral", hint: "Belum terlihat pengunjung." },
  published: { label: "Diterbitkan", tone: "success", hint: "Terlihat pengunjung sekarang." },
  unpublished: { label: "Tidak Diterbitkan", tone: "warning", hint: "Ditarik dari publik; bisa diterbitkan lagi." },
  archived: { label: "Diarsipkan", tone: "neutral", hint: "Disimpan, tidak akan ditampilkan lagi." },
};
export const STATIC_CONTENT_STATUS_OPTIONS = ["draft", "published", "unpublished", "archived"] as const;
export const staticContentStatus = (s: string) => STATIC_CONTENT_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone, hint: "" };

export const INDEXABILITY_LABEL: Record<string, string> = { index: "Boleh diindeks", noindex: "Jangan diindeks" };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type StaticContentForm = {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  indexability: "index" | "noindex";
  sitemapParticipation: boolean;
  status: string;
};

export type StaticContentErrors = Partial<Record<"title" | "slug" | "canonicalUrl", string>>;

export function validateStaticContentForm(f: StaticContentForm): StaticContentErrors {
  const errors: StaticContentErrors = {};
  if (!f.title.trim()) errors.title = "Judul wajib diisi.";
  else if (f.title.trim().length > 200) errors.title = "Maksimal 200 karakter.";
  if (!f.slug.trim()) errors.slug = "Alamat halaman wajib diisi.";
  else if (!SLUG_RE.test(f.slug.trim())) errors.slug = "Hanya huruf kecil, angka, dan tanda hubung (mis. syarat-ketentuan).";
  if (f.canonicalUrl.trim()) {
    try {
      new URL(f.canonicalUrl.trim());
    } catch {
      errors.canonicalUrl = "Harus URL lengkap (mis. https://rumahagen.com/halaman-asli).";
    }
  }
  return errors;
}
