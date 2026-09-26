// lib/agent/stats-view.ts — aturan tampilan Statistik Saya (M08, wireframe 01-Agent/M08-Statistik-Saya): parameter URL (rentang, perbandingan, cakupan), tautan, geometri grafik garis, perubahan persen, dan baris
// pipeline/status. Murni tanpa I/O (diuji). Angka berasal dari RPC agent_statistics_* lewat loadAgentStats (lib/analytics/agent-stats.ts); tanggal = kalender WIB. Rentang kustom dibatasi 120 hari
// (wireframe), lebih ketat dari API (366 hari); hari ini ke depan tidak diperbolehkan.
import { addDays, daysInRange } from "@/lib/analytics/period";
import type { BadgeTone } from "@/components/ui/Badge";
import { LEAD_STATUS } from "./listing-rules";

export type StatsRange = "7" | "14" | "30" | "bulan" | "kustom";
export const RANGE_CHIPS: { key: StatsRange; label: string }[] = [
  { key: "7", label: "7 Hari" },
  { key: "14", label: "14 Hari" },
  { key: "30", label: "30 Hari" },
  { key: "bulan", label: "Bulan Ini" },
  { key: "kustom", label: "Kustom" },
];
export const MAX_CUSTOM_DAYS = 120;

export type StatsState = {
  rentang: StatsRange;
  from: string;
  to: string;
  compare: boolean;
  /** Organisasi yang dilihat (hanya pemimpin); null = statistik milik sendiri. */
  org: string | null;
  /** Nilai mentah isian kustom (untuk mengisi ulang formulir) dan penanda bila tidak valid. */
  dari: string;
  sampai: string;
  customInvalid: boolean;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDate = (s: string) => DATE.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parameter URL -> keadaan. `today` = tanggal WIB hari ini; `leaderOrgIds` = organisasi tempat pengguna pemimpin aktif. */
export function parseStatsSearch(sp: Record<string, string | string[] | undefined>, today: string, leaderOrgIds: string[] = [], defaultOrgId: string | null = null): StatsState {
  const r = one(sp.rentang);
  let rentang: StatsRange = r === "7" || r === "14" || r === "30" || r === "bulan" || r === "kustom" ? r : "30";
  const dari = one(sp.dari) ?? "";
  const sampai = one(sp.sampai) ?? "";
  let from = addDays(today, -29);
  let to = today;
  let customInvalid = false;

  if (rentang === "7") from = addDays(today, -6);
  else if (rentang === "14") from = addDays(today, -13);
  else if (rentang === "bulan") from = `${today.slice(0, 8)}01`;
  else if (rentang === "kustom") {
    const f = isRealDate(dari) ? dari : null;
    const t = isRealDate(sampai) ? (sampai > today ? today : sampai) : null;
    if (f && t && f <= t && daysInRange(f, t) <= MAX_CUSTOM_DAYS) {
      from = f;
      to = t;
    } else {
      customInvalid = true;
      rentang = "30"; // kembali ke bawaan, isian tetap ditampilkan dengan pesan
    }
  }

  const wantsOrg = one(sp.cakupan) === "organisasi" && leaderOrgIds.length > 0;
  const asked = one(sp.org);
  const org = wantsOrg ? (asked && leaderOrgIds.includes(asked) ? asked : defaultOrgId && leaderOrgIds.includes(defaultOrgId) ? defaultOrgId : leaderOrgIds[0]!) : null;

  return { rentang, from, to, compare: one(sp.bandingkan) !== "0", org, dari, sampai, customInvalid };
}

/** Tautan halaman dengan keadaan + perubahan; hanya nilai bukan bawaan yang ditulis. */
export function statsHref(s: StatsState, over: Partial<StatsState> = {}, base = "/agent/statistik"): string {
  const m = { ...s, ...over };
  const q = new URLSearchParams();
  if (m.rentang !== "30") q.set("rentang", m.rentang);
  if (m.rentang === "kustom" || (over.rentang === "kustom" && (m.dari || m.sampai))) {
    if (m.dari) q.set("dari", m.dari);
    if (m.sampai) q.set("sampai", m.sampai);
  }
  if (!m.compare) q.set("bandingkan", "0");
  if (m.org) {
    q.set("cakupan", "organisasi");
    q.set("org", m.org);
  }
  const str = q.toString();
  return str ? `${base}?${str}` : base;
}

/** Alamat ekspor (GET file): rentang eksplisit, sama dengan yang ditampilkan. */
export function exportHref(s: StatsState, format: "xlsx" | "pdf"): string {
  const q = new URLSearchParams({ format, from: s.from, to: s.to, compare: s.compare ? "true" : "false" });
  if (s.org) q.set("organization_id", s.org);
  return `/api/agents/me/statistics/export?${q.toString()}`;
}

const MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export function dateLabel(iso: string, withYear = true): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m! - 1]}${withYear ? ` ${y}` : ""}`;
}
export const rangeLabel = (from: string, to: string) => `${dateLabel(from)} – ${dateLabel(to)} (${daysInRange(from, to)} hari)`;
export const compareLabel = (prev: { from: string; to: string } | null) => (prev ? `Dibanding ${dateLabel(prev.from)} – ${dateLabel(prev.to)}` : "Tanpa perbandingan");

// ── Grafik garis (SVG) ──
export type Spark = { line: string; area: string; prev: string | null; max: number };

/**
 * Jalur SVG untuk garis periode ini (dan pembanding putus-putus). Skala vertikal bermula dari 0 dan dibagi rata untuk kedua garis, sehingga kenaikan tidak dibesar-besarkan.
 * Deret kosong = jalur kosong.
 */
export function sparkGeometry(cur: number[], prev: number[] | null, w = 320, h = 90, pad = 6): Spark {
  const all = [...cur, ...(prev ?? [])];
  const max = all.length > 0 ? Math.max(0, ...all) : 0;
  const path = (a: number[]) =>
    a
      .map((v, i) => {
        const x = a.length === 1 ? 0 : (i / (a.length - 1)) * w;
        const y = h - pad - (max > 0 ? (v / max) * (h - 2 * pad) : 0);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  const line = cur.length > 0 ? path(cur) : "";
  return { line, area: line ? `${line} L${w} ${h} L0 ${h} Z` : "", prev: prev && prev.length > 0 ? path(prev) : null, max };
}

export type Delta = { text: string; tone: BadgeTone };
/** Perubahan persen terhadap periode pembanding: null bila tidak ada pembanding atau pembanding 0 (tidak terdefinisi). */
export function deltaView(pct: number | null): Delta | null {
  if (pct === null || !Number.isFinite(pct)) return null;
  const abs = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(Math.abs(pct));
  if (Math.abs(pct) < 0.05) return { text: "0%", tone: "neutral" };
  return { text: `${pct > 0 ? "▲" : "▼"} ${abs}%`, tone: pct > 0 ? "success" : "danger" };
}

export const conversion = (leads: number, views: number): number | null => (views > 0 ? (leads / views) * 100 : null);
export const pct1 = (n: number | null) => (n === null ? "—" : `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(n)}%`);

// ── Baris pipeline dan status ──
export type BarRow = { key: string; label: string; count: number; share: number; tone?: BadgeTone };

const LEAD_ORDER = ["new", "contacted", "converted", "lost"];
/** Pipeline lead (CHECK listing_leads.status): urutan tetap; status di luar daftar ditambahkan apa adanya. `share` = persen dari total (0-100). */
export function pipelineRows(counts: Record<string, number>): BarRow[] {
  const keys = [...LEAD_ORDER, ...Object.keys(counts).filter((k) => !LEAD_ORDER.includes(k))];
  const total = keys.reduce((a, k) => a + (counts[k] ?? 0), 0);
  return keys.map((k) => ({ key: k, label: LEAD_STATUS[k]?.label ?? k, count: counts[k] ?? 0, share: total > 0 ? ((counts[k] ?? 0) / total) * 100 : 0, tone: LEAD_STATUS[k]?.tone }));
}

export const LISTING_STATUS_LABEL: Record<string, string> = {
  draft: "Draf",
  pending_review: "Ditinjau ulang",
  published: "Dipublikasikan",
  sold: "Terjual",
  rented: "Tersewa",
  expired: "Kedaluwarsa",
  rejected: "Ditolak",
  suspended: "Dibekukan",
};
const LISTING_ORDER = ["published", "pending_review", "draft", "expired", "sold", "rented", "rejected", "suspended"];
/** Kondisi listing saat ini: hanya status yang punya listing; `share` = persen dari jumlah terbanyak (untuk lebar bilah). */
export function listingStatusRows(counts: Record<string, number>): BarRow[] {
  const keys = [...LISTING_ORDER, ...Object.keys(counts).filter((k) => !LISTING_ORDER.includes(k))].filter((k) => (counts[k] ?? 0) > 0);
  const max = Math.max(0, ...keys.map((k) => counts[k] ?? 0));
  return keys.map((k) => ({ key: k, label: LISTING_STATUS_LABEL[k] ?? k, count: counts[k] ?? 0, share: max > 0 ? ((counts[k] ?? 0) / max) * 100 : 0 }));
}

/** Hasil simulasi DBR untuk pembagian bilah (layak/perlu_review/tidak_layak). */
export function dbrRows(d: { layak: number; perlu_review: number; tidak_layak: number }): BarRow[] {
  const total = d.layak + d.perlu_review + d.tidak_layak;
  const mk = (key: string, label: string, count: number, tone: BadgeTone): BarRow => ({ key, label, count, share: total > 0 ? (count / total) * 100 : 0, tone });
  return [mk("layak", "Layak", d.layak, "success"), mk("perlu_review", "Perlu review", d.perlu_review, "warning"), mk("tidak_layak", "Tidak layak", d.tidak_layak, "danger")];
}

/** Pemakaian jatah refresh hari ini: used/allowance dan persen (dibatasi 0-100). */
export function refreshUsage(q: { allowance: number; used_today: number }): { used: number; allow: number; pct: number } {
  const allow = Math.max(0, q.allowance);
  return { used: q.used_today, allow, pct: allow > 0 ? Math.min(100, Math.max(0, (q.used_today / allow) * 100)) : 0 };
}

export const BENCH_LABEL: Record<string, string> = { views: "Dilihat", leads: "Lead", conversion: "Konversi lead per tayangan" };
