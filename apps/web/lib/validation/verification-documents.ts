// lib/validation/verification-documents.ts
// Skema Zod untuk API-013 POST /users/verification-documents (M01, migration
// 0049). Field `review_status`/`reviewed_by`/`rejection_reason` SENGAJA
// TIDAK ADA di sini — hanya staf yang boleh mengisinya (trigger 0055), dan
// STEP11-B1 F11-B1-002/003 eksplisit melarang endpoint GET/PUT/DELETE untuk
// tabel ini ("do not invent") — POST intake ini SATU-SATUNYA route yang
// dibangun untuk agent_verification_documents.

import { z } from "zod";

export const submitVerificationDocumentSchema = z.object({
  doc_type: z.enum(["ktp", "npwp", "sertifikasi_rei", "lainnya"]),
  file_url: z.string().min(1).max(500),
  encrypted: z.boolean().optional(),
});
export type SubmitVerificationDocumentInput = z.infer<typeof submitVerificationDocumentSchema>;
