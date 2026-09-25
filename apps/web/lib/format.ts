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

/** 120 -> "120 m²" (desimal dibuang bila bulat). */
export function formatArea(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)} m²`;
}

const DATE = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

/** ISO -> "1 Des 2026". Nilai kosong/tidak valid -> "". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : DATE.format(d);
}
