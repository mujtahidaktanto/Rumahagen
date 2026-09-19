// lib/seo/sitemap.ts
// Util bersama untuk 4 route sitemap (app/sitemap-*.xml/route.ts) + app/robots.ts
// (STEP11-B9 §5/§6, API-150 s.d. API-154) -- R-02: satu tempat format XML,
// bukan diulang 4x berbeda-beda.
//
// SITE_URL: tidak ada env var domain publik yang sudah ada di proyek ini
// (dicek .env.local/.env.example, kosong) -- default ke domain terverifikasi
// Resend (rumahagen.com) supaya sitemap tetap valid tanpa konfigurasi
// tambahan, bisa di-override lewat NEXT_PUBLIC_SITE_URL kalau perlu.
//
// Pola URL kanonik (/listing/{slug}, /agent/{slug}, /project/{slug}) adalah
// ASUMSI wajar -- Core tidak mengunci struktur URL frontend, dan belum ada
// frontend dibangun di repo ini. Kalau UI (Bolt.new) nanti pakai pola
// berbeda, cukup ubah 3 baris ini, bukan schema/permission apa pun.
import type { SupabaseClient } from "@supabase/supabase-js";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rumahagen.com";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | null;
}

export function buildUrlsetXml(entries: SitemapUrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmodTag = e.lastmod ? `<lastmod>${escapeXml(e.lastmod)}</lastmod>` : "";
      return `<url><loc>${escapeXml(e.loc)}</loc>${lastmodTag}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildSitemapIndexXml(sitemapPaths: string[]): string {
  const items = sitemapPaths
    .map((path) => `<sitemap><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

// true kalau sitemap_enabled TIDAK eksplisit false (default aman: tampil).
// Dipanggil dari route publik (anon), seo_config SELECT memang dibuka
// publik di migration 0097 khusus untuk kebutuhan ini.
export async function isSitemapEnabled(supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase.from("seo_config").select("sitemap_enabled").limit(1).maybeSingle();
  return data?.sitemap_enabled !== false;
}
