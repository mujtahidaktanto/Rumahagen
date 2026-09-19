// app/sitemap-agents.xml/route.ts
// API-152 GET /sitemap-agents.xml (STEP11-B9 §5/§6). Sama dengan kondisi RLS
// agent_profiles_select (0029) untuk baris publik: profile_visibility='public'
// AND deleted_at IS NULL. Pakai public_slug (bukan id) sebagai identifier URL
// -- kolom ini sudah ada sejak 0029, dirancang persis untuk kebutuhan ini.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("agent_profiles")
      .select("public_slug, updated_at")
      .eq("profile_visibility", "public")
      .is("deleted_at", null)
      .not("public_slug", "is", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/agent/${row.public_slug}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-agents.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
