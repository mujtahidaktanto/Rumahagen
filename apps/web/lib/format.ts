// lib/format.ts — format tampilan (Indonesia): rupiah, luas, tanggal. Murni dan mudah diuji.

const rupiah = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** 850000000 -> "Rp 850.000.000". */
export function formatRupiah(value: number): string {
  return `Rp ${rupiah.format(value)}`;
}

const PRICE_SUFFIX: Record<string, string> = { per_bulan: " / bulan", per_tahun: " / tahun" };

/** Harga listing memakai price_unit (total | per_bulan | per_tahun): "Rp 5.000.000 / bulan". */
export function formatListingPrice(price: number, unit: string | null | undefined): string {
  return `${formatRupiah(price)}${unit ? (PRICE_SUFFIX[unit] ?? "") : ""}`;
}

/** Rentang harga proyek: "Rp 650.000.000 – Rp 950.000.000", "Mulai Rp 450.000.000", "Hingga Rp X", satu harga bila min = max, atau "Hubungi developer". Satuan sewa ikut. */
export function formatPriceRange(min: number | null | undefined, max: number | null | undefined, unit: string | null | undefined): string {
  const suffix = unit ? (PRICE_SUFFIX[unit] ?? "") : "";
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  if (hasMin && hasMax) return min === max ? `${formatRupiah(min)}${suffix}` : `${formatRupiah(min)} – ${formatRupiah(max)}${suffix}`;
  if (hasMin) return `Mulai ${formatRupiah(min)}${suffix}`;
  if (hasMax) return `Hingga ${formatRupiah(max)}${suffix}`;
  return "Hubungi developer";
}

/** 120 -> "120 m²" (desimal dibuang bila bulat). */
export function formatArea(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)} m²`;
}

/**
 * Nomor telepon Indonesia -> URL WhatsApp (wa.me memakai kode negara tanpa +): "0812-3456-7890" / "+62 812 3456 7890" / "62812..." -> https://wa.me/628123456789.
 * Nomor yang bukan angka atau terlalu pendek (< 9 digit) -> null (tombol tidak ditampilkan).
 */
export function whatsappUrl(phone: string | null | undefined, text?: string): string | null {
  if (!phone) return null;
  let d = phone.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/\+/g, "");
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  else if (d.startsWith("8")) d = `62${d}`;
  if (!/^\d{9,15}$/.test(d)) return null;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

const DATE =new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

const DATETIME_DATE = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const DATETIME_TIME = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" });

/** ISO -> "18 Okt 2026 · 19.00 WIB" (zona Asia/Jakarta). Kosong/tidak valid -> "". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${DATETIME_DATE.format(d)} · ${DATETIME_TIME.format(d).replace(":", ".")} WIB`;
}

/** ISO -> "1 Des 2026". Nilai kosong/tidak valid -> "". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : DATE.format(d);
}
