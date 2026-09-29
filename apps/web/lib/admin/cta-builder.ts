// lib/admin/cta-builder.ts — pemilih CTA terstruktur untuk Form Banner (M09, keputusan produk "CTA promo terstruktur": admin memilih jenis + isi lewat dropdown, TIDAK mengetik format
// "jenis:isi" secara manual — pengurai/pemakainya ada di lib/public/cta.ts). Modul terpisah dan murni (aman dibundel Client Component) karena lib/public/cta.ts mengimpor
// @/lib/supabase/server di tingkat modul (dipakai resolveCta) — mengimpornya dari komponen klien akan menyeret next/headers ke bundel klien. Daftar CTA_KINDS/CTA_PAGES di sini
// HARUS SAMA PERSIS dengan lib/public/cta.ts (satu-satunya yang menguraikan dan memakai nilainya di sisi publik); jangan ubah salah satu tanpa yang lain.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CTA_KINDS = ["none", "project", "course", "event", "page", "whatsapp", "url"] as const;
export type CtaKindOrNone = (typeof CTA_KINDS)[number];

export const CTA_KIND_LABEL: Record<CtaKindOrNone, string> = {
  none: "Tanpa tombol CTA",
  project: "Proyek Developer (slug)",
  course: "Kursus (ID)",
  event: "Event (ID)",
  page: "Halaman tetap",
  whatsapp: "WhatsApp",
  url: "Tautan luar (https)",
};

/** Sama persis dengan CTA_PAGES di lib/public/cta.ts. */
export const CTA_PAGE_OPTIONS: { key: string; label: string }[] = [
  { key: "listing", label: "Cari Listing" },
  { key: "agen", label: "Cari Agen" },
  { key: "organisasi", label: "Organisasi" },
  { key: "developer", label: "Developer dan Proyek" },
  { key: "event", label: "Daftar Event" },
  { key: "learning", label: "Daftar Kursus" },
  { key: "learning-session", label: "Learning Session" },
  { key: "konten", label: "Pusat Bantuan" },
  { key: "promo", label: "Promo dan Pengumuman" },
  { key: "daftar", label: "Daftar Akun" },
  { key: "login", label: "Masuk" },
];

export type CtaFormValue = { kind: CtaKindOrNone; slugOrId: string; pageKey: string; phone: string; waText: string; url: string };
export const EMPTY_CTA_FORM: CtaFormValue = { kind: "none", slugOrId: "", pageKey: CTA_PAGE_OPTIONS[0]!.key, phone: "", waText: "", url: "" };

/** Isian -> cta_reference "jenis:isi" (atau null bila "Tanpa tombol CTA" atau isian kosong/tidak valid — banner tetap valid tanpa CTA). */
export function buildCtaReference(f: CtaFormValue): string | null {
  switch (f.kind) {
    case "none":
      return null;
    case "project": {
      const v = f.slugOrId.trim();
      return SLUG.test(v) ? `project:${v}` : null;
    }
    case "course":
    case "event": {
      const v = f.slugOrId.trim().toLowerCase();
      return UUID.test(v) ? `${f.kind}:${v}` : null;
    }
    case "page":
      return f.pageKey ? `page:${f.pageKey}` : null;
    case "whatsapp": {
      const phone = f.phone.trim();
      if (!phone) return null;
      const text = f.waText.trim();
      return text ? `whatsapp:${phone}?text=${encodeURIComponent(text)}` : `whatsapp:${phone}`;
    }
    case "url": {
      const v = f.url.trim();
      return v.startsWith("https://") ? `url:${v}` : null;
    }
  }
}

/** cta_reference tersimpan -> isian formulir, untuk membuka form Ubah dengan pilihan yang benar. Format tak dikenal -> "none" (admin memilih ulang; nilai lama tidak ditampilkan sebagai teks bebas). */
export function parseCtaForEdit(ref: string | null | undefined): CtaFormValue {
  const v = (ref ?? "").trim();
  const m = /^([a-z]+):(.*)$/s.exec(v);
  if (!m) return EMPTY_CTA_FORM;
  const kind = m[1] as string;
  const rest = (m[2] ?? "").trim();
  if (kind === "project") return { ...EMPTY_CTA_FORM, kind: "project", slugOrId: rest };
  if (kind === "course" || kind === "event") return { ...EMPTY_CTA_FORM, kind, slugOrId: rest };
  if (kind === "page" && CTA_PAGE_OPTIONS.some((p) => p.key === rest)) return { ...EMPTY_CTA_FORM, kind: "page", pageKey: rest };
  if (kind === "whatsapp") {
    const q = rest.indexOf("?");
    const phone = q >= 0 ? rest.slice(0, q) : rest;
    const text = q >= 0 ? new URLSearchParams(rest.slice(q + 1)).get("text") : null;
    return { ...EMPTY_CTA_FORM, kind: "whatsapp", phone, waText: text ?? "" };
  }
  if (kind === "url") return { ...EMPTY_CTA_FORM, kind: "url", url: rest };
  return EMPTY_CTA_FORM;
}
