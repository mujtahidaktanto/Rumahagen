// lib/validation/listing-quota.ts
// Skema Zod untuk GET /agents/me/listing-quota (kuota penerbitan listing, migration 0140).

import { z } from "zod";

export const listingQuotaQuerySchema = z.object({
  organization_id: z.string().uuid().optional(),
});
export type ListingQuotaQuery = z.infer<typeof listingQuotaQuerySchema>;

interface QuotaBucket {
  limit: number;
  used: number;
  remaining: number;
  period_start: string | null;
  resets_at: string | null;
}

// Bentuk hasil RPC listing_quota_summary().
export interface ListingQuotaSummary {
  scope: "personal" | "organization";
  free: QuotaBucket;
  pro: QuotaBucket & { active: boolean };
  purchased: { balance: number };
  total_remaining: number;
  validity_days: number;
  grace_days: number;
}
