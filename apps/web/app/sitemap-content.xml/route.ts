// app/sitemap-content.xml/route.ts
// Sitemap Konten Publik/Pusat Bantuan. Kondisi sama dengan lib/public/content-data.ts
// (getArticle): status='published' DAN indexability='index' — artikel yang staf
// tandai noindex (robots:{index:false} di halamannya) sengaja TIDAK dimasukkan
// sitemap, supaya sitemap tidak bertentangan dengan meta robots halamannya sendiri.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("static_public_content")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("indexability", "index");

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/konten/${row.slug}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-content.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
