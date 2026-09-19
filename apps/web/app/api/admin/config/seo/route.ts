// app/api/admin/config/seo/route.ts
// CORE-CFG-SEO-01 GET/PUT /admin/config/seo (STEP11-B9 §6, "PRESERVE /
// INVENTORY CORRECTION" -- otoritas M09 admin config, semantik M11 SEO).
// Baris tunggal (seo_config, migration 0097) sama seperti dbr_config —
// PUT meng-update baris yang ada, bukan insert baru. Otorisasi lewat RLS
// (has_permission('m09.system_configuration.manage'), permission yang
// SUDAH ADA sejak 0009/0011 — tidak ada permission baru, lihat komentar
// migration 0097).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { seoConfigUpdateSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("seo_config").select("*").limit(1).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "seo_config belum ada baris.");
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, seoConfigUpdateSchema);
  const supabase = await createClient();

  const { data: existing, error: findErr } = await supabase.from("seo_config").select("id").limit(1).maybeSingle();
  if (findErr) {
    throw findErr;
  }
  if (!existing) {
    throw new ApiError("NOT_FOUND", "seo_config belum ada baris untuk di-update.");
  }

  const { data, error } = await supabase
    .from("seo_config")
    .update({ ...body, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah seo_config.");
  }

  return { data };
});
