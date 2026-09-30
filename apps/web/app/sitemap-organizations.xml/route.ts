// app/sitemap-organizations.xml/route.ts
// Sitemap Organisasi publik. Kondisi sama dengan lib/public/organization-data.ts
// (getOrganizationDetail): status='active', deleted_at IS NULL. URL pakai
// slug (bukan id), sama seperti pola sitemap-agents.xml.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("organizations")
      .select("slug, updated_at")
      .eq("status", "active")
      .is("deleted_at", null)
      .not("slug", "is", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/organisasi/${row.slug}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-organizations.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
