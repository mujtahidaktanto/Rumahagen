// app/api/admin/seo/reindex/route.ts
// API-155 POST /admin/seo/reindex (STEP11-B9 §6, "M11 SEO operational
// discovery action, subject to M09/M10 admin control"). Otorisasi lewat RLS
// seo_config_write yang sama dengan /admin/config/seo (has_permission
// 'm09.system_configuration.manage') -- UPDATE ke seo_config yang gagal
// karena RLS akan melempar 403 lewat mapping 42501 di lib/api/handler.ts.
//
// CATATAN JUJUR SOAL PERILAKU: tidak ada integrasi nyata ke Google Search
// Console / Bing Webmaster API di repo ini (tidak ada kredensial API
// tersedia) -- endpoint ini HANYA mencatat kapan & oleh siapa reindex
// diminta (last_reindex_requested_at/_by di seo_config), TIDAK benar-benar
// memicu crawl mesin pencari mana pun. Kalau nanti ada kredensial resmi
// (mis. Google Indexing API service account, atau IndexNow key Bing),
// panggilan API sungguhan bisa ditambahkan di sini tanpa mengubah kontrak
// endpoint.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data: existing, error: findErr } = await supabase.from("seo_config").select("id").limit(1).maybeSingle();
  if (findErr) {
    throw findErr;
  }
  if (!existing) {
    throw new ApiError("NOT_FOUND", "seo_config belum ada baris.");
  }

  const { data, error } = await supabase
    .from("seo_config")
    .update({
      last_reindex_requested_at: new Date().toISOString(),
      last_reindex_requested_by: ctx.userId,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("last_reindex_requested_at, last_reindex_requested_by")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk memicu reindex.");
  }

  return { data: { reindex_requested: true, ...data } };
});
