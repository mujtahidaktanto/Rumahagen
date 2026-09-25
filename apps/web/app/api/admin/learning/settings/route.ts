// app/api/admin/learning/settings/route.ts
// GET/PATCH /admin/learning/settings — pengaturan belajar M04 satu baris (migration 0150): batas dan jeda kuis pihak ketiga, penerbitan sertifikat otomatis,
// template dan penandatangan bawaan, bonus LP akun baru, dan hadiah LP per kejadian (enroll, selesai, lulus kuis). Nilai divalidasi CHECK di database dan
// setiap perubahan menaikkan `version` serta tercatat di audit log (m04.learning_settings.update).
//
// Otorisasi lewat RLS learning_settings_select/_update (permission m04.learning_economy_configuration.view/.manage yang sudah ada). Ini pengaturan eksplisit;
// endpoint key-value lama /admin/learning/configuration tetap ada dan tidak terkait.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { learningSettingsPatchSchema } from "@/lib/validation/learning-settings";
import { certAssetExists, certAssetSignedUrl } from "@/lib/storage/certificate-assets";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("learning_settings").select("*").maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk melihat pengaturan belajar.");
  }
  return { data: { ...data, default_signer_signature_url: await certAssetSignedUrl(data.default_signer_signature_path) } };
});

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, learningSettingsPatchSchema);
  const supabase = await createClient();

  const newPath = body.default_signer_signature_path;
  if (newPath) {
    if (!newPath.startsWith("defaults/")) {
      throw new ApiError("VALIDATION_ERROR", "File tanda tangan bawaan harus berada di folder defaults/.");
    }
    if (!(await certAssetExists(newPath))) {
      throw new ApiError("VALIDATION_ERROR", "File tanda tangan belum diunggah. Unggah dulu lewat upload-url.");
    }
  }

  const { data, error } = await supabase.from("learning_settings").update(body).eq("id", true).select().maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah pengaturan belajar.");
  }

  return { data: { ...data, default_signer_signature_url: await certAssetSignedUrl(data.default_signer_signature_path) } };
});
