// lib/analytics/period.ts
// Aritmetika tanggal kalender WIB sebagai string YYYY-MM-DD. Semua dihitung
// di UTC murni atas string tanggal (tanpa zona waktu), supaya tidak ada
// pergeseran hari; pembagian hari WIB terjadi di DB (0124).

const DAY_MS = 86400000;

const toMs = (d: string): number => Date.parse(`${d}T00:00:00Z`);
const fromMs = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

export function addDays(d: string, n: number): string {
  return fromMs(toMs(d) + n * DAY_MS);
}

export function daysInRange(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS) + 1;
}

export function enumerateDays(from: string, to: string): string[] {
  const n = daysInRange(from, to);
  return Array.from({ length: n }, (_, i) => addDays(from, i));
}

/** Rentang pembanding: sama panjang, tepat sebelum `from`. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const n = daysInRange(from, to);
  const prevTo = addDays(from, -1);
  return { from: addDays(prevTo, -(n - 1)), to: prevTo };
}

/** 'YYYY-MM' dari tanggal. */
export function monthOf(d: string): string {
  return d.slice(0, 7);
}

export function addMonths(month: string, n: number): string {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7)) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  return `${String(yy).padStart(4, "0")}-${String(mm + 1).padStart(2, "0")}`;
}

export function monthStart(month: string): string {
  return `${month}-01`;
}

export function monthEnd(month: string): string {
  return addDays(monthStart(addMonths(month, 1)), -1);
}
