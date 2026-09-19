// app/robots.ts
// API-154 GET /robots.txt (STEP11-B9 §5/§6, M11 discovery policy). Konvensi
// bawaan Next.js App Router (bukan folder literal seperti sitemap-*.xml,
// karena robots.txt memang punya konvensi resmi app/robots.ts yang
// menghasilkan Response text/plain otomatis).
//
// robots_global_noindex (seo_config, migration 0097) jadi saklar darurat
// "disallow semua" -- berguna kalau environment ini sedang staging/belum
// siap diindeks, tanpa perlu deploy ulang.

import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/seo/sitemap";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let globalNoindex = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("seo_config").select("robots_global_noindex").limit(1).maybeSingle();
    globalNoindex = data?.robots_global_noindex === true;
  } catch (err) {
    console.error("[robots.txt] gagal membaca seo_config, default allow:", err);
  }

  if (globalNoindex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}
