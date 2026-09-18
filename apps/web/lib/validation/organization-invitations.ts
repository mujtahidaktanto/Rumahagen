// lib/validation/organization-invitations.ts
// Skema Zod untuk organization_invitations (M12 Fase 1, migration 0050).
// STEP11-B6 API-161 (leader invite)/API-162 (agent join-request) evidenced
// — dua endpoint berbeda menulis ke tabel yang sama dengan
// initiated_by_type berbeda. `organization_document` SENGAJA TIDAK
// dibangun route-nya — STEP11-B6 §baris 390/534 eksplisit: "No dedicated
// current document route... controlled data/API gaps, not grounds for
// inventing tables" (tabelnya sudah ada dari migration, tapi routenya
// bukan untuk diarang di sini).

import { z } from "zod";

export const createLeaderInviteSchema = z.object({
  agent_id: z.string().uuid(),
  expires_at: z.string().datetime().optional(),
});
export type CreateLeaderInviteInput = z.infer<typeof createLeaderInviteSchema>;

export const createJoinRequestSchema = z.object({
  expires_at: z.string().datetime().optional(),
});
export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>;
