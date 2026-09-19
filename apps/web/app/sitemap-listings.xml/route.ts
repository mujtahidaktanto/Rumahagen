// app/sitemap-listings.xml/route.ts
// API-151 GET /sitemap-listings.xml (STEP11-B9 §5/§6). Hanya listing
// status='published' -- sama persis dengan kondisi RLS
// listings_select_published_or_owner_or_staff (0018) untuk baris publik,
// jadi anon client di sini otomatis konsisten dengan apa yang benar-benar
// bisa dibaca publik lewat REST biasa juga.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("status", "published")
      .not("slug", "is", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/listing/${row.slug}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-listings.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
