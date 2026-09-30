// app/sitemap-promo.xml/route.ts
// Sitemap Promo publik. Kondisi sama dengan lib/public/promo-data.ts (getPromo):
// status='active' — jendela schedule_at/expires_at sudah ditegakkan RLS
// public_announcement_promotion_select_public (0014), tidak perlu diulang di sini.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("public_announcement_promotion")
      .select("id, updated_at")
      .eq("status", "active");

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/promo/${row.id}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-promo.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
