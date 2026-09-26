// lib/public/cta.ts — tujuan tombol ajakan (CTA) promo/pengumuman dari kolom `public_announcement_promotion.cta_reference` (teks maks. 500 karakter, tanpa perubahan skema).
// Format terstruktur "jenis:isi" yang nanti dihasilkan pemilih di form admin (admin tidak mengetik format ini); nilai lama berupa jalur situs/https tetap diterima:
//   project:{slug}   -> /project/{slug}           course:{uuid} -> /learning/{uuid}      event:{uuid} -> /event/{uuid}
//   page:{kunci}     -> halaman tetap (CTA_PAGES)  whatsapp:{nomor}[?text=pesan] -> wa.me  url:https://...  -> tautan luar (https)
// Jenis project/course/event hanya menjadi tombol bila targetnya terlihat publik (resolveCta), agar tidak mengarah ke halaman "tidak ditemukan".
import { whatsappUrl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const CTA_KINDS = ["project", "course", "event", "page", "whatsapp", "url"] as const;
export type CtaKind = (typeof CTA_KINDS)[number];

/** Halaman tetap yang boleh dipilih admin (hanya halaman yang sudah ada). Kunci disimpan di data; label untuk pemilih admin. */
export const CTA_PAGES: Record<string, { path: string; label: string }> = {
  listing: { path: "/listing", label: "Cari Listing" },
  agen: { path: "/agen", label: "Cari Agen" },
  organisasi: { path: "/organisasi", label: "Organisasi" },
  developer: { path: "/developer", label: "Developer dan Proyek" },
  event: { path: "/event", label: "Daftar Event" },
  learning: { path: "/learning", label: "Daftar Kursus" },
  "learning-session": { path: "/learning-session", label: "Learning Session" },
  konten: { path: "/konten", label: "Pusat Bantuan" },
  promo: { path: "/promo", label: "Promo dan Pengumuman" },
  daftar: { path: "/daftar", label: "Daftar Akun" },
  login: { path: "/login", label: "Masuk" },
};

export type ParsedCta =
  | { kind: "project"; slug: string }
  | { kind: "course"; id: string }
  | { kind: "event"; id: string }
  | { kind: "page"; key: string }
  | { kind: "whatsapp"; phone: string; text: string | null }
  | { kind: "url"; url: string }
  | { kind: "legacy"; href: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Jalur situs sendiri ("/promo/x", bukan "//host") atau URL https. Selain itu null. */
export function safeHref(ref: string | null | undefined): string | null {
  const v = (ref ?? "").trim();
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Menguraikan cta_reference; format tidak dikenal/tidak aman -> null (tombol tidak tampil). */
export function parseCta(ref: string | null | undefined): ParsedCta | null {
  const v = (ref ?? "").trim();
  if (!v) return null;
  const m = /^([a-z]+):(.*)$/s.exec(v);
  if (m && (CTA_KINDS as readonly string[]).includes(m[1] ?? "")) {
    const kind = m[1] as CtaKind;
    const rest = (m[2] ?? "").trim();
    switch (kind) {
      case "project":
        return SLUG.test(rest) ? { kind, slug: rest } : null;
      case "course":
      case "event":
        return UUID.test(rest) ? { kind, id: rest.toLowerCase() } : null;
      case "page":
        return Object.hasOwn(CTA_PAGES, rest) ? { kind, key: rest } : null;
      case "whatsapp": {
        const q = rest.indexOf("?");
        const phone = (q >= 0 ? rest.slice(0, q) : rest).trim();
        const text = q >= 0 ? new URLSearchParams(rest.slice(q + 1)).get("text") : null;
        return whatsappUrl(phone) ? { kind, phone, text: text && text.trim() ? text.trim().slice(0, 500) : null } : null;
      }
      case "url": {
        const u = safeHref(rest);
        return u && u.startsWith("https://") ? { kind, url: u } : null;
      }
    }
  }
  const href = safeHref(v); // nilai lama: jalur situs atau https
  return href ? { kind: "legacy", href } : null;
}

export type CtaTarget = { href: string; label: string; external: boolean; related: { kind: "project" | "course" | "event"; title: string } | null };

const GENERIC_LABEL = "Lihat Selengkapnya";

/** Tujuan untuk jenis yang tidak butuh database (page, whatsapp, url, legacy); jenis lain -> null (lihat resolveCta). */
export function staticCtaTarget(p: ParsedCta): CtaTarget | null {
  switch (p.kind) {
    case "page":
      return { href: CTA_PAGES[p.key]?.path ?? "/", label: GENERIC_LABEL, external: false, related: null };
    case "whatsapp": {
      const href = whatsappUrl(p.phone, p.text ?? undefined);
      return href ? { href, label: "Hubungi via WhatsApp", external: true, related: null } : null;
    }
    case "url":
      return { href: p.url, label: GENERIC_LABEL, external: true, related: null };
    case "legacy":
      return { href: p.href, label: GENERIC_LABEL, external: p.href.startsWith("https://"), related: null };
    default:
      return null;
  }
}

/** Tujuan tombol CTA. project/course/event dicari di database dengan RLS pengunjung: tidak terlihat publik atau gagal dimuat -> null (tombol disembunyikan). */
export async function resolveCta(ref: string | null | undefined): Promise<CtaTarget | null> {
  const parsed = parseCta(ref);
  if (!parsed) return null;
  const fixed = staticCtaTarget(parsed);
  if (fixed) return fixed;

  const supabase = await createClient();
  if (parsed.kind === "project") {
    const { data } = await supabase.from("developer_projects").select("slug, name").eq("slug", parsed.slug).maybeSingle<{ slug: string; name: string }>();
    return data ? { href: `/project/${data.slug}`, label: "Lihat Proyek", external: false, related: { kind: "project", title: data.name } } : null;
  }
  if (parsed.kind === "course") {
    const { data } = await supabase.from("courses").select("id, title").eq("id", parsed.id).eq("status", "published").is("deleted_at", null).maybeSingle<{ id: string; title: string }>();
    return data ? { href: `/learning/${data.id}`, label: "Lihat Kursus", external: false, related: { kind: "course", title: data.title } } : null;
  }
  if (parsed.kind === "event") {
    const { data } = await supabase.from("events").select("id, title").eq("id", parsed.id).eq("status", "published").eq("visibility", "public").is("deleted_at", null).maybeSingle<{ id: string; title: string }>();
    return data ? { href: `/event/${data.id}`, label: "Lihat Event", external: false, related: { kind: "event", title: data.title } } : null;
  }
  return null;
}
