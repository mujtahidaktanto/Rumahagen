// lib/validation/certificates.ts
// Skema Zod untuk CERTIFICATES (M04 Learning Catalog, migration 0061; diperluas 0150). Penerbitan manual HANYA staf (admin_issue_certificate) dan hanya untuk
// Agent yang enrollment-nya sudah selesai; Agent TIDAK PERNAH bisa menerbitkan untuk orang lain (self-issue hanya lewat unduhan kursus yang sudah selesai).

import { z } from "zod";

export const issueCertificateSchema = z.object({
  agent_id: z.string().uuid(),
  course_id: z.string().uuid(),
});
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;

export const revokeCertificateSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

export const certificateCodeSchema = z.string().regex(/^[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}$/);
