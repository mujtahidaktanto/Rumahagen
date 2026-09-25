// app/sitemap-agents.xml/route.ts
// API-152 GET /sitemap-agents.xml (STEP11-B9 §5/§6). Sama dengan kondisi RLS
// view public_agent_profiles (0148; hanya profil public, tanpa timestamp sehingga tanpa lastmod)
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
      .from("public_agent_profiles")
      .select("public_slug")
      .not("public_slug", "is", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/agen/${row.public_slug}`, // /agen/{slug} (keputusan 2026-09-26): /agent adalah area aplikasi Agent yang dijaga login
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-agents.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
