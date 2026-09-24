// lib/commercial/subscription-state.ts
// Turunan status langganan untuk tampilan. subscriptions.status adalah teks bebas (0071) yang hanya diubah staf/siklus pembayaran,
// jadi status "aktif" di database bisa sudah melewati ends_at. Fungsi ini tidak mengubah data; hanya menghitung status efektif.

export const EXPIRING_SOON_DAYS = 7;

export type EffectiveSubscriptionStatus = "active" | "expiring" | "expired" | "pending" | "cancelled" | "unknown";

export interface SubscriptionRow {
  status: string;
  ends_at: string | null;
  [key: string]: unknown;
}

export function deriveSubscriptionState(row: SubscriptionRow, now: Date = new Date()) {
  const endsAt = row.ends_at ? new Date(row.ends_at) : null;
  const msLeft = endsAt ? endsAt.getTime() - now.getTime() : null;
  const daysLeft = msLeft === null ? null : Math.max(0, Math.ceil(msLeft / 86_400_000));

  let effective: EffectiveSubscriptionStatus;
  switch (row.status) {
    case "active":
      if (msLeft !== null && msLeft <= 0) effective = "expired";
      else if (daysLeft !== null && daysLeft <= EXPIRING_SOON_DAYS) effective = "expiring";
      else effective = "active";
      break;
    case "pending":
      effective = "pending";
      break;
    case "expired":
      effective = "expired";
      break;
    case "cancelled":
      effective = "cancelled";
      break;
    default:
      effective = "unknown";
  }

  return {
    effective_status: effective,
    days_left: effective === "active" || effective === "expiring" ? daysLeft : null,
    is_current: effective === "active" || effective === "expiring",
  };
}
