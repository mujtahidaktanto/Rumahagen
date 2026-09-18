// lib/validation/claims.ts
// Skema Zod untuk lifecycle Agent Project Claim. Field persis mengikuti
// kolom `public.agent_project_claims` di
// supabase/migrations/0035_m06_marketing_kit_claims.sql. Status lifecycle:
// pending -> approved/rejected/revoked (trigger trg_project_claim_review_stamp
// otomatis mengisi reviewed_by/reviewed_at). `withdrawn` ditambahkan 0085
// (Gate PRE-00-H: PENDING -> WITHDRAWN, self-service Agent, terpisah dari
// revoked) -- RLS m06.claim.withdraw yang menegakkan siapa boleh set nilai ini.

import { z } from "zod";

export const claimStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "revoked", "withdrawn"]),
});
export type ClaimStatusInput = z.infer<typeof claimStatusSchema>;
