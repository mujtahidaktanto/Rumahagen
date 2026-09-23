// app/api/admin/learning/configuration/route.ts
// GET/PUT /admin/learning/configuration — API-074/075 (M04, STEP11-A,
// PRESERVE — admin-surface gap terakhir dari audit M01-M15). Tidak ada
// {key} di path (beda dari /admin/config/system/{key}) -- GET
// mengembalikan SEMUA baris sekaligus, PUT upsert SATU pasangan
// config_key/config_value per panggilan lewat body. Isi/skema tidak
// dievidensi Core sama sekali -- bentuk key-value generik
// (public.learning_economy_configs) adalah keputusan rekayasa, lihat
// header migration 0109 untuk alasan lengkap.
//
// Otorisasi lewat RLS learning_economy_configs_select/_write (0109) --
// m04.learning_economy_configuration.view/.manage, permission BARU (Gate
// PRE-00-F §19, tidak ada di master matrix 50-baris) — Superadmin/Admin/
// Manager=ALL, semua role lain=NONE efektif (baris Instructor='own' di
// seed sengaja tidak pernah lolos di endpoint admin ini karena tabel
// config global tidak punya owner_id -- lihat migration 0109).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { learningEconomyConfigUpsertSchema } from "@/lib/validation/learning-points";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_economy_configs")
    .select("*")
    .order("config_key", { ascending: true });

  if (error) throw error;

  return { data: data ?? [] };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, learningEconomyConfigUpsertSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_economy_configs")
    .upsert(
      { config_key: body.config_key, config_value: body.config_value, updated_by: ctx.userId },
      { onConflict: "config_key" },
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah Learning Economy Configuration.");
  }

  return { data };
});
