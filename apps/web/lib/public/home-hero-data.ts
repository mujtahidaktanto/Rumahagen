// lib/public/home-hero-data.ts — slide banner hero halaman utama publik (M11), dibaca dari `home_hero_banners` (migration 0167) dengan RLS anon: hanya is_active=true,
// urut display_order. Tautan tujuan tiap slide (cta_reference) diselesaikan di server lewat resolveCta (lib/public/cta.ts) sama seperti Detail Promo, supaya slide yang
// menunjuk proyek/kursus/event yang tidak lagi terlihat publik otomatis tidak jadi tautan (gambar tetap tampil, tanpa link).
import { createClient } from "@/lib/supabase/server";
import { resolveCta, safeHref } from "@/lib/public/cta";

export type HeroBannerSlide = { id: string; imageUrl: string; altText: string; href: string | null; external: boolean };
export type HeroBannersResult = { ok: true; slides: HeroBannerSlide[] } | { ok: false; slides: [] };

type Row = { id: string; image_reference: string; alt_text: string | null; cta_reference: string | null };

export async function getActiveHeroBanners(limit = 8): Promise<HeroBannersResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_hero_banners")
    .select("id, image_reference, alt_text, cta_reference")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<Row[]>();
  if (error) return { ok: false, slides: [] };

  const slides = await Promise.all(
    (data ?? [])
      .map((r) => ({ ...r, imageUrl: safeHref(r.image_reference) }))
      .filter((r): r is Row & { imageUrl: string } => !!r.imageUrl)
      .map(async (r) => {
        const cta = await resolveCta(r.cta_reference);
        return { id: r.id, imageUrl: r.imageUrl, altText: r.alt_text ?? "", href: cta?.href ?? null, external: cta?.external ?? false };
      }),
  );
  return { ok: true, slides };
}
