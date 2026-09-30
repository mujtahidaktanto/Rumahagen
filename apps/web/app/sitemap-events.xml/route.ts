// app/sitemap-events.xml/route.ts
// Sitemap Event publik. Kondisi SAMA PERSIS dengan filter yang dipakai
// halaman publik (lib/public/event-data.ts: searchEvents/getEventDetail) —
// status='published', visibility='public', deleted_at IS NULL — supaya
// sitemap konsisten dengan apa yang sungguh terlihat publik.

import { createClient } from "@/lib/supabase/server";
import { buildUrlsetXml, isSitemapEnabled, xmlResponse, SITE_URL } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isSitemapEnabled(supabase))) {
      return xmlResponse(buildUrlsetXml([]));
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, updated_at")
      .eq("status", "published")
      .eq("visibility", "public")
      .is("deleted_at", null);

    if (error) {
      throw error;
    }

    const entries = (data ?? []).map((row) => ({
      loc: `${SITE_URL}/event/${row.id}`,
      lastmod: row.updated_at,
    }));

    return xmlResponse(buildUrlsetXml(entries));
  } catch (err) {
    console.error("[sitemap-events.xml] gagal membangun sitemap:", err);
    return xmlResponse(buildUrlsetXml([]));
  }
}
