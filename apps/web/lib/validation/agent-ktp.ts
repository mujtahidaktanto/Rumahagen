// lib/validation/agent-ktp.ts
// Skema Zod untuk verifikasi KTP Agent (migration 0149). Nomor KTP (NIK) 16 digit; pemeriksaan kode wilayah dan tanggal lahir ditegakkan database (is_valid_nik).

import { z } from "zod";
import { KTP_CONTENT_TYPES, MAX_KTP_BYTES } from "@/lib/storage/agent-ktp";

export const ktpUploadUrlSchema = z.object({
  content_type: z.enum(Object.keys(KTP_CONTENT_TYPES) as [keyof typeof KTP_CONTENT_TYPES, ...(keyof typeof KTP_CONTENT_TYPES)[]]),
  size_bytes: z.number().int().positive().max(MAX_KTP_BYTES, "Ukuran foto KTP maksimal 5 MB.").optional(),
});

export const submitKtpSchema = z.object({
  ktp_number: z.string().regex(/^[0-9]{16}$/, "Nomor KTP harus 16 digit angka."),
  photo_path: z.string().min(1).max(300),
});
export type SubmitKtpInput = z.infer<typeof submitKtpSchema>;

export const resetKtpSchema = z.object({ reason: z.string().trim().min(3).max(500) });
