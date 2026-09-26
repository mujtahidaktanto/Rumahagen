// lib/agent/commercial-rules.ts — aturan tampilan Komersial Agent (M14: Katalog add-on, Pesanan & Kuota, Langganan Saya). Murni tanpa I/O (diuji). Nilai status mengikuti apa yang benar-benar ditulis database:
// commercial_orders.status = pending | confirmed | cancelled (fungsi 0079/0081; tanpa CHECK, jadi 'expired' dari wireframe dan nilai tak dikenal tetap ditampilkan aman), commercial_entitlements.lifecycle_status
// (CHECK 0019: pending/active/expired/revoked/consumed/reversed), payment_transactions.payment_state (CHECK). Harga selalu dari server; klien tidak pernah menghitung atau mengirim harga.
import type { BadgeTone } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/format";

export type CapacityType = "listing_refresh" | "listing_slot" | "learning_point";
export type Capacity = { type: string; value: number };

export type AddonLike = {
  capacity_type: string | null;
  capacity_value: number | string | null;
  additional_capacities?: { capacity_type: string; capacity_value: number | string }[] | null;
  validity_type: string;
  validity_days: number | null;
};

const nf = new Intl.NumberFormat("id-ID");

/** Kapasitas utama lalu tambahan, apa adanya (nilai tak valid dibuang). */
export function addonCapacities(a: AddonLike): Capacity[] {
  const all: Capacity[] = [];
  if (a.capacity_type && a.capacity_value !== null && Number(a.capacity_value) > 0) all.push({ type: a.capacity_type, value: Number(a.capacity_value) });
  for (const c of a.additional_capacities ?? []) if (Number(c.capacity_value) > 0) all.push({ type: c.capacity_type, value: Number(c.capacity_value) });
  return all;
}

export function capacityLabel(c: Capacity): string {
  const v = nf.format(c.value);
  if (c.type === "listing_refresh") return `${v} kali Refresh Listing`;
  if (c.type === "listing_slot") return `${v} slot listing`;
  if (c.type === "learning_point") return `${v} Learning Points`;
  return `${v} ${c.type}`;
}

export const hasSlot = (a: AddonLike) => addonCapacities(a).some((c) => c.type === "listing_slot");

/** Catatan masa berlaku untuk pembeli. Slot dan saldo Refresh tidak kedaluwarsa (keputusan produk 2026-09-25/26), apa pun isi validity_*. */
export function addonValidityLabel(a: AddonLike): string {
  const caps = addonCapacities(a);
  const noExpiry = caps.length > 0 && caps.every((c) => c.type === "listing_slot" || c.type === "listing_refresh");
  if (noExpiry) return "Tidak kedaluwarsa dan tidak reset; dipakai sampai habis";
  if (a.validity_type === "days" && a.validity_days) return `Masa berlaku ${nf.format(a.validity_days)} hari`;
  return "Tanpa batas waktu";
}

export type Offer = { promotion_id: string; eligible: boolean; reason: string | null; list_price: number; final_amount: number };

/** Harga yang akan ditagih menurut penawaran promosi: promosi berlaku = harga akhir, selain itu harga normal. Angka ini hanya tampilan; server menghitung ulang saat pesanan dibuat. */
export function displayedPrice(listPrice: number, offer: Offer | null | undefined): { amount: number; listPrice: number; discounted: boolean; note: string | null } {
  if (offer && offer.eligible && offer.final_amount < listPrice) return { amount: offer.final_amount, listPrice, discounted: true, note: null };
  return { amount: listPrice, listPrice, discounted: false, note: offer && !offer.eligible ? offer.reason : null };
}

/** promotion_id yang dikirim ke server: hanya bila promosi berlaku untuk pembeli (server tetap memvalidasi). */
export const promotionIdToSend = (offer: Offer | null | undefined) => (offer && offer.eligible ? offer.promotion_id : undefined);

export const formatMoney = (n: number) => formatRupiah(n);

// ── Pesanan ──
export const ORDER_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Menunggu Pembayaran", tone: "warning" },
  confirmed: { label: "Terkonfirmasi", tone: "success" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
  expired: { label: "Kedaluwarsa", tone: "danger" },
};
export const orderStatus = (s: string) => ORDER_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };
/** Hanya pesanan pending yang bisa dibayar atau dibatalkan (API menolak selain itu). */
export const canPayOrCancel = (status: string) => status === "pending";

/** Nama produk pesanan dari snapshot yang dibekukan server (addon atau paket); tanpa snapshot = "Pesanan". */
export function orderProductName(snapshot: unknown): string {
  const s = (snapshot ?? {}) as { addon?: { name?: unknown }; plan?: { name?: unknown } };
  const name = s.addon?.name ?? s.plan?.name;
  return typeof name === "string" && name.trim() ? name : "Pesanan";
}
export const orderKind = (o: { subscription_plan_id: string | null; addon_id: string | null }) => (o.subscription_plan_id ? "Paket Langganan" : "Add-on");

// ── Entitlement ──
export const ENTITLEMENT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Menunggu Aktivasi", tone: "warning" },
  active: { label: "Aktif", tone: "success" },
  expired: { label: "Kedaluwarsa", tone: "neutral" },
  revoked: { label: "Dicabut", tone: "danger" },
  consumed: { label: "Habis Terpakai", tone: "neutral" },
  reversed: { label: "Dibatalkan Sistem", tone: "danger" },
};
export const entitlementStatus = (s: string) => ENTITLEMENT_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };

/** Jenis kapasitas dari entitlement_type: "<kode_addon>:<jenis>" (add-on), atau kunci sistem (bonus/jatah harian). */
export function entitlementLabel(type: string): string {
  if (type === "refresh_bonus") return "Bonus Refresh Harian";
  if (type === "listing_refresh_allowance") return "Jatah Refresh Harian";
  const kind = type.includes(":") ? type.slice(type.lastIndexOf(":") + 1) : type;
  if (kind === "listing_refresh") return "Refresh Listing";
  if (kind === "listing_slot") return "Slot Listing Tambahan";
  if (kind === "learning_point") return "Learning Points";
  return type;
}

export function entitlementExpiry(e: { ends_at: string | null; lifecycle_status: string }, fmt: (iso: string) => string): string {
  if (!e.ends_at) return "Tidak kedaluwarsa";
  return e.lifecycle_status === "active" || e.lifecycle_status === "pending" ? `Berlaku s/d ${fmt(e.ends_at)}` : `Berakhir ${fmt(e.ends_at)}`;
}

// ── Pembayaran ──
/** Alamat pembayaran hanya diikuti bila https dan milik Midtrans (server mengembalikan redirect_url dari Snap; jangan pernah mengarahkan browser ke host lain). */
export function safePaymentUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return u.hostname === "midtrans.com" || u.hostname.endsWith(".midtrans.com") ? u.toString() : null;
  } catch {
    return null;
  }
}

// ── Langganan ──
export const SUBSCRIPTION_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Aktif", tone: "success" },
  expiring: { label: "Segera Berakhir", tone: "warning" },
  expired: { label: "Berakhir", tone: "neutral" },
  pending: { label: "Menunggu", tone: "warning" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
  unknown: { label: "Status tidak dikenal", tone: "danger" },
};
export const subscriptionStatus = (s: string) => SUBSCRIPTION_STATUS[s] ?? SUBSCRIPTION_STATUS.unknown!;

export const durationLabel = (months: number) => (months === 12 ? "12 bulan (1 tahun)" : `${months} bulan`);

/** "50 kali Refresh Listing" untuk entitlement (jenis diambil dari akhiran entitlement_type "<kode>:<jenis>"). */
export function entitlementCapacityLabel(type: string, value: number): string {
  const kind = type.includes(":") ? type.slice(type.lastIndexOf(":") + 1) : type;
  if (kind === "refresh_bonus" || kind === "listing_refresh_allowance") return `${nf.format(value)} kali per hari`;
  return capacityLabel({ type: kind, value });
}

/** Parameter ?tampil= halaman Pesanan: bilangan bulat 10..200 kelipatan halaman, selain itu 10. */
export function parseOrderLimit(raw: string | string[] | undefined, page = 10, max = 200): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n >= page && n <= max ? n : page;
}
