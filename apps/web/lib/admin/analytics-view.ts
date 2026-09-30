// lib/admin/analytics-view.ts — aturan tampilan Dashboard Analytics Admin (M09, wireframe 02-Admin/M09-Dashboard-Analytics): parameter URL (rentang, perbandingan), tautan, dan
// format angka per satuan. Murni tanpa I/O (diuji). Geometri grafik garis (`sparkGeometry`), badge perubahan (`deltaView`), dan label tanggal DIPAKAI ULANG langsung dari
// lib/agent/stats-view.ts (fungsi pure generik, sudah dipakai Statistik Saya Agent — bukan spesifik Agent). Angka dari RPC admin_analytics_flow/funnel dan tabel
// metrics_daily_snapshot lewat loadDashboard (lib/analytics/dashboard.ts, itu sendiri PURE di level modul — parameternya SupabaseClient, tidak mengimpor lib/supabase/server —
// jadi aman diimpor komponen klien juga). Tanggal = kalender WIB. Rentang kustom dibatasi 366 hari (sama seperti batas server, analyticsRangeQuerySchema) — beda dari Statistik
// Saya Agent yang membatasi 120 hari di klien karena dashboard ini untuk investor/manajemen yang wajar melihat setahun penuh.
import { compareLabel, dateLabel, deltaView, rangeLabel, sparkGeometry } from "@/lib/agent/stats-view";
import { formatRupiah } from "@/lib/format";
import type { Unit } from "@/lib/analytics/dashboard";

export { compareLabel, dateLabel, deltaView, rangeLabel, sparkGeometry };

export type AnalyticsRange = "7" | "14" | "30" | "bulan" | "kustom";
export const RANGE_CHIPS: { key: AnalyticsRange; label: string }[] = [
  { key: "7", label: "7 Hari" },
  { key: "14", label: "14 Hari" },
  { key: "30", label: "30 Hari" },
  { key: "bulan", label: "Bulan Ini" },
  { key: "kustom", label: "Kustom" },
];
export const MAX_CUSTOM_DAYS = 366;

export type AnalyticsState = {
  rentang: AnalyticsRange;
  from: string;
  to: string;
  compare: boolean;
  dari: string;
  sampai: string;
  customInvalid: boolean;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDate = (s: string) => DATE.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
const addDaysLocal = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Parameter URL -> keadaan. `today` = tanggal WIB hari ini. */
export function parseAnalyticsSearch(sp: Record<string, string | string[] | undefined>, today: string): AnalyticsState {
  const r = one(sp.rentang);
  let rentang: AnalyticsRange = r === "7" || r === "14" || r === "30" || r === "bulan" || r === "kustom" ? r : "30";
  const dari = one(sp.dari) ?? "";
  const sampai = one(sp.sampai) ?? "";
  let from = addDaysLocal(today, -29);
  let to = today;
  let customInvalid = false;

  if (rentang === "7") from = addDaysLocal(today, -6);
  else if (rentang === "14") from = addDaysLocal(today, -13);
  else if (rentang === "bulan") from = `${today.slice(0, 8)}01`;
  else if (rentang === "kustom") {
    const f = isRealDate(dari) ? dari : null;
    const t = isRealDate(sampai) ? (sampai > today ? today : sampai) : null;
    if (f && t && f <= t && daysBetween(f, t) <= MAX_CUSTOM_DAYS) {
      from = f;
      to = t;
    } else {
      customInvalid = true;
      rentang = "30";
    }
  }

  return { rentang, from, to, compare: one(sp.bandingkan) !== "0", dari, sampai, customInvalid };
}

/** Tautan halaman dengan keadaan + perubahan; hanya nilai bukan bawaan yang ditulis. */
export function analyticsHref(s: AnalyticsState, over: Partial<AnalyticsState> = {}, base = "/admin"): string {
  const m = { ...s, ...over };
  const q = new URLSearchParams();
  if (m.rentang !== "30") q.set("rentang", m.rentang);
  if (m.rentang === "kustom" || (over.rentang === "kustom" && (m.dari || m.sampai))) {
    if (m.dari) q.set("dari", m.dari);
    if (m.sampai) q.set("sampai", m.sampai);
  }
  if (!m.compare) q.set("bandingkan", "0");
  const str = q.toString();
  return str ? `${base}?${str}` : base;
}

/** Alamat ekspor (GET file, Superadmin saja — m09.administrative_export.export). */
export function exportHref(s: AnalyticsState, format: "xlsx" | "pdf"): string {
  const q = new URLSearchParams({ format, from: s.from, to: s.to, compare: s.compare ? "true" : "false" });
  return `/api/admin/analytics/export?${q.toString()}`;
}

/** Periode pembanding otomatis (rentang yang sama persis sebelum `from`), untuk teks "Dibanding ...". */
export function previousOf(s: AnalyticsState): { from: string; to: string } {
  const n = daysBetween(s.from, s.to);
  const to = addDaysLocal(s.from, -1);
  const from = addDaysLocal(to, -(n - 1));
  return { from, to };
}

const nf = new Intl.NumberFormat("id-ID");
const nf1 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

/** Format nilai metrik sesuai satuannya (Unit dari lib/analytics/dashboard.ts). `null` = "—". */
export function formatUnit(value: number | null, unit: Unit): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (unit === "idr") return formatRupiah(value);
  if (unit === "pct") return `${nf1.format(value)}%`;
  if (unit === "days") return `${nf1.format(value)} hari`;
  return nf.format(value);
}
