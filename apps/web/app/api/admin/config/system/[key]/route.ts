// app/api/admin/config/system/[key]/route.ts
// API-238 GET (satu key), API-239 PUT /admin/config/system/{key} — upsert
// (Superadmin-only lewat RLS system_configs_write, has_permission
// m09.system_configuration.manage, 0011 — menutup R-06).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { systemConfigUpsertSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_configs")
    .select("*")
    .eq("config_key", ctx.params.key)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", `Config key '${ctx.params.key}' tidak ditemukan.`);
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, systemConfigUpsertSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("system_configs")
    .upsert(
      { config_key: ctx.params.key, config_value: body.config_value, updated_by: ctx.userId },
      { onConflict: "config_key" },
    )
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah system config.");
  }

  return { data };
});
