// lib/validation/certificates.ts
// Skema Zod untuk CERTIFICATES (M04 Learning Catalog, migration 0061).
// STEP11-B4 API-056. Issuance ADD-NEW (hanya staf, lihat 0061 — Agent
// TIDAK PERNAH diberi grant m04.certificate.manage demi mencegah self-issue).

import { z } from "zod";

export const issueCertificateSchema = z.object({
  agent_id: z.string().uuid(),
  course_id: z.string().uuid(),
  certificate_url: z.string().max(500).optional(),
});
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
