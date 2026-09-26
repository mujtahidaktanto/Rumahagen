// lib/agent/time.ts — waktu kalender WIB dan waktu relatif, murni tanpa I/O (dipakai server dan komponen klien).
import { formatDate } from "@/lib/format";

/** Tanggal kalender WIB (YYYY-MM-DD). */
export function todayWIB(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

/** Awal bulan sampai hari ini (WIB), untuk kartu "bulan ini". */
export function monthRangeWIB(now: Date = new Date()): { from: string; to: string } {
  const to = todayWIB(now);
  return { from: `${to.slice(0, 8)}01`, to };
}

/** "Baru saja", "12 menit lalu", "1 jam lalu", "Kemarin", "3 hari lalu", selain itu tanggal. Hari dihitung menurut kalender WIB. */
export function relativeTimeId(iso: string, now: Date = new Date()): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  const diffMin = Math.floor((now.getTime() - t.getTime()) / 60_000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const dayOf = (d: Date) => Date.parse(todayWIB(d));
  const days = Math.round((dayOf(now) - dayOf(t)) / 86_400_000);
  if (days <= 0) return `${Math.floor(diffMin / 60)} jam lalu`;
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return formatDate(iso);
}
