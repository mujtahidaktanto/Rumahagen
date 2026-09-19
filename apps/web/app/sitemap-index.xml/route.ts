// app/sitemap-index.xml/route.ts
// API-150 GET /sitemap-index.xml (STEP11-B9 §5/§6, M11 discovery). Folder
// literal "sitemap-index.xml" (bukan konvensi bawaan Next app/sitemap.ts)
// karena Core mengunci 4 nama file terpisah (index + listings + agents +
// developer-projects), sedangkan sitemap.ts bawaan Next hanya menghasilkan
// satu /sitemap.xml.
//
// Rute publik murni (bukan JSON API) -- TIDAK dibungkus withApiHandler
// karena kontrak responsnya XML mentah untuk crawler, bukan amplop
// {data, meta} REST internal.

import { createClient } from "@/lib/supabase/server";
import { buildSitemapIndexXml, isSitemapEnabled, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  try {
    const supabase = await createClient();
    const enabled = await isSitemapEnabled(supabase);

    if (!enabled) {
      return xmlResponse(buildSitemapIndexXml([]));
    }

    return xmlResponse(
      buildSitemapIndexXml(["/sitemap-listings.xml", "/sitemap-agents.xml", "/sitemap-developer-projects.xml"]),
    );
  } catch (err) {
    console.error("[sitemap-index.xml] gagal membangun sitemap index:", err);
    return xmlResponse(buildSitemapIndexXml([]));
  }
}
