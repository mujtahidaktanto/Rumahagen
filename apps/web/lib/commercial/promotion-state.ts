// lib/commercial/promotion-state.ts
// Status efektif promosi untuk tampilan. promotions.status hanya diubah staf, jadi promosi 'active' bisa sudah lewat valid_to
// atau belum mulai. Fungsi ini tidak mengubah data. Aturan sama dengan compute_addon_order_price (migration 0131):
// promosi hanya berlaku bila status 'active' dan sekarang berada dalam [valid_from, valid_to].

export type EffectivePromotionStatus = "draft" | "scheduled" | "active" | "expired" | "inactive";

export interface PromotionRow {
  status: string;
  valid_from: string | null;
  valid_to: string | null;
  benefit_configuration?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export function derivePromotionState(row: PromotionRow, now: Date = new Date()) {
  const from = row.valid_from ? new Date(row.valid_from) : null;
  const to = row.valid_to ? new Date(row.valid_to) : null;

  let effective: EffectivePromotionStatus;
  if (row.status === "draft") effective = "draft";
  else if (row.status === "inactive") effective = "inactive";
  else if (row.status === "expired") effective = "expired";
  else if (to && to.getTime() < now.getTime()) effective = "expired";
  else if (from && from.getTime() > now.getTime()) effective = "scheduled";
  else effective = "active";

  const b = row.benefit_configuration ?? {};
  const benefit_label =
    typeof b.percent_off === "number" ? `${b.percent_off}%` : typeof b.amount_off === "number" ? `Rp ${b.amount_off}` : null;

  return { effective_status: effective, is_applicable: effective === "active", benefit_label };
}
