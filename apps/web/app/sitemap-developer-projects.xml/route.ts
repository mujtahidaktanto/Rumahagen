// app/sitemap-developer-projects.xml/route.ts
// API-153 GET /sitemap-developer-projects.xml (STEP11-B9 §5/§6). Set status
// sama dengan kondisi RLS developer_projects_select (0034): status IN
// ('active','coming_soon','sold_out') -- ketiganya sudah publicly readable
// lewat RLS (developer aktif), jadi sitemap konsisten dengan apa yang
// sungguh bisa diakses publik lewat REST biasa.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("developer_projects")
      .select("slug, updated_at")
      .in("status", ["active", "coming_soon", "sold_out"])
      .not("slug", "is", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/project/${row.slug}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-developer-projects.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
