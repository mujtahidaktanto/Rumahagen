// lib/validation/learning-settings.ts
// Skema Zod untuk pengaturan belajar M04 (migration 0150): learning_settings (satu baris), konfigurasi sertifikat per kursus, dan unggah logo/tanda tangan.
// Aturan angka juga ditegakkan CHECK di database; skema ini memberi pesan galat yang jelas lebih awal.

import { z } from "zod";
import { CERT_ASSET_CONTENT_TYPES, MAX_CERT_ASSET_BYTES } from "@/lib/storage/certificate-assets";

export const templateEnum = z.enum(["classic", "modern", "corporate", "premium"]);
const contentTypeEnum = z.enum(Object.keys(CERT_ASSET_CONTENT_TYPES) as [keyof typeof CERT_ASSET_CONTENT_TYPES, ...(keyof typeof CERT_ASSET_CONTENT_TYPES)[]]);
const lpAmount = z.number().min(0).max(1_000_000);
const shortName = z.string().trim().min(1, "Wajib diisi.").max(120);

export const learningSettingsPatchSchema = z
  .object({
    external_quiz_max_attempts: z.number().int().min(1).max(1000).nullable(),
    external_quiz_cooldown_minutes: z.number().int().min(0).max(10_080),
    certificate_auto_issue: z.boolean(),
    default_certificate_template: templateEnum,
    default_signer_name: shortName,
    default_signer_title: shortName,
    default_signer_signature_path: z.string().max(300).nullable(),
    signup_bonus_lp: lpAmount,
    reward_lp_enrollment: lpAmount,
    reward_lp_completion: lpAmount,
    reward_lp_quiz_pass: lpAmount,
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Kirim minimal satu field yang diubah.");
export type LearningSettingsPatch = z.infer<typeof learningSettingsPatchSchema>;

export const certAssetUploadSchema = z.object({
  content_type: contentTypeEnum,
  size_bytes: z.number().int().positive().max(MAX_CERT_ASSET_BYTES, "Ukuran file maksimal 1 MB.").optional(),
});
export const courseCertAssetUploadSchema = certAssetUploadSchema.extend({ kind: z.enum(["logo", "signature"]) });

// PUT penuh (menggantikan seluruh konfigurasi). Kolom yang null = pakai nilai bawaan dari pengaturan global.
export const courseCertificateConfigSchema = z.object({
  organizer_type: z.enum(["rumahagen", "partner", "instructor"]),
  certificate_template: templateEnum.nullable(),
  signer_name: shortName.nullable(),
  signer_title: shortName.nullable(),
  signer_signature_path: z.string().max(300).nullable(),
  partner_logo_paths: z.array(z.string().max(300)).max(2, "Maksimal 2 logo mitra."),
  quiz_max_attempts: z.number().int().min(1).max(1000).nullable(),
  quiz_cooldown_minutes: z.number().int().min(0).max(10_080).nullable(),
  // Title (M15) yang diberikan otomatis saat course selesai (migration 0155). Dihilangkan = tidak diubah; null = melepas title; harus title active dengan scope aktif.
  awards_title_definition_id: z.string().uuid().nullable().optional(),
});
export type CourseCertificateConfigInput = z.infer<typeof courseCertificateConfigSchema>;
