// app/api/admin/config/dbr/route.ts
// API-129 PUT /admin/config/dbr (+ GET pelengkap yang wajar). Sumber: migration
// 0008_dbr_config.sql — menutup D13-04 (keputusan M10 menang atas wording lama
// "Superadmin-only": Superadmin/Admin/Manager=ALL, Agent=OWN lewat
// has_permission('m07.dbr.domain_operations', updated_by)). Baris tunggal
// (di-seed 0009) — PUT di sini meng-update baris yang ada, bukan insert baru.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { dbrConfigUpdateSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dbr_config").select("*").limit(1).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "dbr_config belum ada baris.");
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, dbrConfigUpdateSchema);
  const supabase = await createClient();

  const { data: existing, error: findErr } = await supabase.from("dbr_config").select("id").limit(1).maybeSingle();
  if (findErr) {
    throw findErr;
  }
  if (!existing) {
    throw new ApiError("NOT_FOUND", "dbr_config belum ada baris untuk di-update.");
  }

  const { data, error } = await supabase
    .from("dbr_config")
    .update({ ...body, updated_by: ctx.userId })
    .eq("id", existing.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah dbr_config.");
  }

  return { data };
});
