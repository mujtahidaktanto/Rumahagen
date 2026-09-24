// lib/analytics/dashboard.ts
// Perakitan data Dashboard Analytics Admin (docs/analytics/
// METRIC_DEFINITIONS_v1.md v1.1).
//   - Metrik ARUS: RPC admin_analytics_flow (0124), dihitung langsung dari
//     data operasional. Otorisasi (Superadmin/Admin/Manager) ada di DB.
//   - Metrik STOK: tabel metrics_daily_snapshot (0123), diisi job harian.
//     Kosong sampai job berjalan -- hasilnya null/kosong, bukan angka palsu.
// assembleDashboard() murni (tanpa I/O) supaya builder export bisa diuji
// tanpa database.

import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, addMonths, daysInRange, enumerateDays, monthEnd, monthOf, monthStart, previousRange } from "./period";

export const DEFINITION_VERSION = "v1.1";

export type Unit = "int" | "idr" | "pct" | "days";
export type GroupId = "pengguna" | "marketplace" | "organisasi" | "learning" | "komersial" | "aktivitas" | "risiko";

export const GROUP_LABELS: Record<GroupId, string> = {
  pengguna: "Pengguna & Agen",
  marketplace: "Marketplace",
  organisasi: "Organisasi",
  learning: "Learning RumahAgen",
  komersial: "Komersial",
  aktivitas: "Aktivitas & Retensi",
  risiko: "Kualitas & Risiko",
};

export const GROUP_ORDER: GroupId[] = ["pengguna", "marketplace", "organisasi", "learning", "komersial", "aktivitas", "risiko"];

export const GROUP_NOTES: Record<GroupId, string> = {
  pengguna: "Agen aktif = minimal 1 aktivitas bermakna (login, buat/ubah/refresh listing, terima lead) dalam 30 hari. Staf, akun uji, dan terhapus dikeluarkan.",
  marketplace: "Lead = klik CTA WhatsApp; lead unik didedup per pengunjung per listing per hari.",
  organisasi: "Organisasi aktif = status active, tidak dalam penutupan, tidak suspended.",
  learning: "Menyelesaikan = penyelesaian enrollment/sesi. Completion rate dihitung per kohort pendaftaran.",
  komersial: "Transaksi sukses = settlement/capture terverifikasi. Net = gross dikurangi refund dan chargeback penuh. Tanggal transaksi = paid_at.",
  aktivitas: "DAU/WAU/MAU dihitung dari agen aktif pada snapshot harian. Stickiness = rata-rata DAU / MAU akhir.",
  risiko: "Suspended hanya sebagai rasio saat ini; tren suspended dan penutupan organisasi tidak ditampilkan.",
};

export interface Point {
  day: string;
  value: number;
}

export interface SeriesResult {
  key: string;
  label: string;
  group: GroupId;
  kind: "flow" | "stock";
  unit: Unit;
  current: Point[];
  previous: Point[] | null;
  value: number | null;
  previous_value: number | null;
  delta_pct: number | null;
  note?: string;
}

export interface Tile {
  key: string;
  label: string;
  group: GroupId;
  value: number | null;
  unit: Unit;
  note?: string;
}

export interface FunnelResult {
  cohort_from: string;
  cohort_to: string;
  steps: { key: string; label: string; count: number; pct: number | null }[];
  median_days_to_first_lead: number | null;
}

export interface CohortRow {
  cohort: string;
  size: number | null;
  retention: (number | null)[];
}

export interface Dashboard {
  generated_at: string;
  definition_version: string;
  range: { from: string; to: string; days: number };
  previous: { from: string; to: string } | null;
  series: SeriesResult[];
  tiles: Tile[];
  roles: { role: string; count: number }[] | null;
  funnel: FunnelResult | null;
  cohorts: CohortRow[] | null;
  snapshot: { first_date: string | null; last_date: string | null };
  notes: string[];
  unavailable: { key: string; label: string; reason: string }[];
}

interface FlowSpec {
  key: string;
  label: string;
  group: GroupId;
  unit: Unit;
  note?: string;
}

const FLOW_SPECS: FlowSpec[] = [
  { key: "agents_new", label: "Agen Baru", group: "pengguna", unit: "int" },
  { key: "listings_new", label: "Listing Baru (dipublikasikan)", group: "marketplace", unit: "int" },
  { key: "leads_total", label: "Lead Total", group: "marketplace", unit: "int" },
  { key: "leads_unique", label: "Lead Unik", group: "marketplace", unit: "int", note: "Klik pemilik listing dan bot belum bisa dikeluarkan (tidak ada penandanya di data)." },
  { key: "refresh_count", label: "Refresh Listing", group: "marketplace", unit: "int" },
  { key: "projects_new", label: "Proyek Developer Baru", group: "marketplace", unit: "int", note: "Dihitung saat dibuat (bukan saat dipublikasikan) karena tidak ada timestamp publikasi." },
  { key: "claims_approved", label: "Klaim Proyek Disetujui", group: "marketplace", unit: "int" },
  { key: "orgs_new", label: "Organisasi Baru", group: "organisasi", unit: "int" },
  { key: "learning_registrations", label: "Pendaftar Learning (pendaftaran)", group: "learning", unit: "int" },
  { key: "learning_registrants_unique", label: "Pendaftar Learning (pengguna unik harian)", group: "learning", unit: "int", note: "Total = jumlah pengguna unik per hari; pengguna yang mendaftar di beberapa hari terhitung lebih dari sekali." },
  { key: "learning_completions", label: "Menyelesaikan Learning", group: "learning", unit: "int", note: "Belum difilter hasil qualifying." },
  { key: "certificates_issued", label: "Sertifikat Diterbitkan", group: "learning", unit: "int" },
  { key: "points_issued", label: "Learning Points Diterbitkan", group: "learning", unit: "int" },
  { key: "gmv_gross", label: "GMV (Gross)", group: "komersial", unit: "idr" },
  { key: "revenue_subscription", label: "Pendapatan Langganan", group: "komersial", unit: "idr" },
  { key: "revenue_addon", label: "Pendapatan Add-on", group: "komersial", unit: "idr" },
  { key: "addon_buyers", label: "Pembeli Add-on (unik harian)", group: "komersial", unit: "int", note: "Total = jumlah pembeli unik per hari." },
  { key: "appeals_new", label: "Banding Penghargaan Masuk", group: "risiko", unit: "int" },
];

const STOCK_KEYS = [
  "agents_active_1d", "agents_active_7d", "agents_active_30d", "agents_dormant_90d", "agents_newly_dormant", "agents_suspended",
  "users_by_role", "organizations_active", "listings_published", "listings_expired", "subscribers_paid_active", "mrr_idr",
  "reconciliation_cases_open", "award_appeals_pending",
] as const;

export interface RawFlow {
  current: Map<string, Map<string, number>>;
  previous: Map<string, Map<string, number>> | null;
}

export interface SnapshotRow {
  snapshot_date: string;
  metric_key: string;
  dimension: string;
  value: number;
}

export interface RawInput {
  from: string;
  to: string;
  compare: boolean;
  flow: RawFlow;
  snapshot: SnapshotRow[];
  funnel: FunnelResult | null;
  cohortRows: SnapshotRow[];
  generatedAt: string;
}

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const deltaPct = (v: number | null, p: number | null): number | null =>
  v === null || p === null || p === 0 ? null : (v / p - 1) * 100;

function flowPoints(map: Map<string, number> | undefined, days: string[]): Point[] {
  return days.map((day) => ({ day, value: map?.get(day) ?? 0 }));
}

function lastValue(points: Point[]): number | null {
  const last = points[points.length - 1];
  return last ? last.value : null;
}

/** Deret harian metrik stok = jumlah semua dimensi pada tanggal itu. */
function snapshotSeries(rows: SnapshotRow[], key: string, from: string, to: string): Point[] {
  const byDay = new Map<string, number>();
  for (const r of rows) {
    if (r.metric_key !== key || r.snapshot_date < from || r.snapshot_date > to) continue;
    byDay.set(r.snapshot_date, (byDay.get(r.snapshot_date) ?? 0) + r.value);
  }
  return [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, value]) => ({ day, value }));
}

export function assembleDashboard(raw: RawInput): Dashboard {
  const { from, to } = raw;
  const days = enumerateDays(from, to);
  const prev = raw.compare ? previousRange(from, to) : null;
  const prevDays = prev ? enumerateDays(prev.from, prev.to) : null;
  const series: SeriesResult[] = [];

  const pushFlow = (key: string, label: string, group: GroupId, unit: Unit, cur: Point[], pre: Point[] | null, note?: string) => {
    const v = sum(cur.map((p) => p.value));
    const pv = pre ? sum(pre.map((p) => p.value)) : null;
    series.push({ key, label, group, kind: "flow", unit, current: cur, previous: pre, value: v, previous_value: pv, delta_pct: deltaPct(v, pv), ...(note ? { note } : {}) });
  };

  const flowOf = (key: string): { cur: Point[]; pre: Point[] | null } => ({
    cur: flowPoints(raw.flow.current.get(key), days),
    pre: prevDays && raw.flow.previous ? flowPoints(raw.flow.previous.get(key), prevDays) : null,
  });

  for (const s of FLOW_SPECS) {
    const { cur, pre } = flowOf(s.key);
    pushFlow(s.key, s.label, s.group, s.unit, cur, pre, s.note);
    if (s.key === "gmv_gross") {
      const ref = flowOf("refunded_amount");
      const net = (g: Point[], r: Point[]) => g.map((p, i) => ({ day: p.day, value: p.value - (r[i]?.value ?? 0) }));
      pushFlow("net_value", "Nilai Transaksi Net", "komersial", "idr", net(cur, ref.cur), pre && ref.pre ? net(pre, ref.pre) : null,
        "Gross dikurangi refund/chargeback penuh; refund parsial tidak dikurangkan (jumlahnya tidak tersimpan).");
    }
    if (s.key === "claims_approved") {
      const lu = flowOf("leads_unique");
      const vw = flowOf("listing_views");
      const ratio = (l: Point[], v: Point[]) => l.map((p, i) => ({ day: p.day, value: (v[i]?.value ?? 0) > 0 ? (p.value / (v[i]?.value ?? 1)) * 100 : 0 }));
      const rangeRatio = (l: Point[], v: Point[]): number => (sum(v.map((p) => p.value)) > 0 ? (sum(l.map((p) => p.value)) / sum(v.map((p) => p.value))) * 100 : 0);
      const cv = rangeRatio(lu.cur, vw.cur);
      const pv = lu.pre && vw.pre ? rangeRatio(lu.pre, vw.pre) : null;
      series.push({ key: "conversion_visitor_to_lead", label: "Konversi Pengunjung ke Lead", group: "marketplace", kind: "flow", unit: "pct",
        current: ratio(lu.cur, vw.cur), previous: lu.pre && vw.pre ? ratio(lu.pre, vw.pre) : null, value: cv, previous_value: pv, delta_pct: deltaPct(cv, pv),
        note: "Lead unik / kunjungan listing pada rentang." });
    }
  }

  const stock = (key: string, label: string, group: GroupId, unit: Unit, note?: string) => {
    const cur = snapshotSeries(raw.snapshot, key, from, to);
    const pre = prev ? snapshotSeries(raw.snapshot, key, prev.from, prev.to) : null;
    const v = lastValue(cur);
    const pv = pre ? lastValue(pre) : null;
    series.push({ key, label, group, kind: "stock", unit, current: cur, previous: pre, value: v, previous_value: pv, delta_pct: deltaPct(v, pv), ...(note ? { note } : {}) });
  };
  stock("agents_active_30d", "Agen Aktif", "pengguna", "int", "Posisi akhir rentang, dari snapshot harian.");
  stock("organizations_active", "Organisasi Aktif", "organisasi", "int");
  stock("subscribers_paid_active", "Subscriber Berbayar Aktif", "komersial", "int", "Langganan berbayar (order terkonfirmasi > 0); free membership tidak dihitung.");
  stock("mrr_idr", "MRR", "komersial", "idr", "Order terkonfirmasi terakhir per langganan dibagi jumlah bulan periode.");
  stock("agents_active_1d", "DAU", "aktivitas", "int");
  stock("agents_active_7d", "WAU", "aktivitas", "int");

  const get = (k: string) => series.find((s) => s.key === k);
  const val = (k: string): number | null => get(k)?.value ?? null;
  const tiles: Tile[] = [];
  const tile = (key: string, label: string, group: GroupId, value: number | null, unit: Unit, note?: string) =>
    tiles.push({ key, label, group, value: value === null || !Number.isFinite(value) ? null : value, unit, ...(note ? { note } : {}) });

  const latest = (key: string): number | null => lastValue(snapshotSeries(raw.snapshot, key, "0000-01-01", to));
  const gmv = val("gmv_gross"), net = val("net_value"), addon = val("revenue_addon"), sub = val("revenue_subscription");
  const mrr = val("mrr_idr");
  const subscribers = val("subscribers_paid_active");
  const mau = latest("agents_active_30d");
  const dauSeries = get("agents_active_1d")?.current ?? [];
  const dauAvg = dauSeries.length ? sum(dauSeries.map((p) => p.value)) / dauSeries.length : null;

  tile("agents_dormant_90d", "Agen dormant (>90 hari)", "pengguna", latest("agents_dormant_90d"), "int");
  tile("agents_suspended", "Agen suspended saat ini", "risiko", latest("agents_suspended"), "int", "Angka terkini, tanpa tren.");
  const agentsTotal = raw.snapshot.filter((r) => r.metric_key === "users_by_role" && r.dimension === "agent").sort((a, b) => (a.snapshot_date < b.snapshot_date ? -1 : 1)).pop()?.value ?? null;
  tile("suspended_ratio", "Rasio agen suspended", "risiko", agentsTotal ? ((latest("agents_suspended") ?? 0) / agentsTotal) * 100 : null, "pct");
  tile("reconciliation_open", "Kasus rekonsiliasi terbuka", "risiko", latest("reconciliation_cases_open"), "int");
  tile("appeals_pending", "Banding menunggu keputusan", "risiko", latest("award_appeals_pending"), "int");
  const pub = latest("listings_published"), exp = latest("listings_expired");
  tile("listing_active_ratio", "Listing aktif dibanding total (aktif + kedaluwarsa)", "marketplace", pub !== null && exp !== null && pub + exp > 0 ? (pub / (pub + exp)) * 100 : null, "pct");
  const pubSeries = snapshotSeries(raw.snapshot, "listings_published", from, to);
  const avgPub = pubSeries.length ? sum(pubSeries.map((p) => p.value)) / pubSeries.length : null;
  tile("leads_per_listing", "Lead unik per listing aktif", "marketplace", avgPub ? (val("leads_unique") ?? 0) / avgPub : null, "int", "Lead unik rentang / rata-rata listing aktif pada snapshot.");
  tile("median_days_first_lead", "Waktu ke lead pertama (median, hari)", "marketplace", raw.funnel?.median_days_to_first_lead ?? null, "days", "Kohort daftar bulan lalu, sejak listing pertama dipublikasikan.");
  tile("refund_rate", "Refund rate", "komersial", gmv ? (((gmv - (net ?? gmv)) / gmv) * 100) : null, "pct", "(refund + chargeback penuh) / gross.");
  tile("addon_share", "Porsi pendapatan add-on", "komersial", addon !== null && sub !== null && addon + sub > 0 ? (addon / (addon + sub)) * 100 : null, "pct");
  tile("arr", "ARR (MRR x 12)", "komersial", mrr === null ? null : mrr * 12, "idr");
  tile("arpu_paid", "ARPU pengguna berbayar (bulanan)", "komersial", mrr !== null && subscribers ? mrr / subscribers : null, "idr", "MRR / subscriber berbayar aktif.");
  tile("arpu_all", "ARPU semua agen aktif (bulanan)", "komersial", mrr !== null && mau ? mrr / mau : null, "idr", "MRR / agen aktif 30 hari.");
  tile("stickiness", "Stickiness (rata-rata DAU / MAU)", "aktivitas", dauAvg !== null && mau ? (dauAvg / mau) * 100 : null, "pct");
  const newlyDormant = snapshotSeries(raw.snapshot, "agents_newly_dormant", from, to);
  const mauStart = snapshotSeries(raw.snapshot, "agents_active_30d", from, to)[0]?.value ?? null;
  tile("agent_churn", "Churn agen (rentang terpilih)", "aktivitas", newlyDormant.length && mauStart ? (sum(newlyDormant.map((p) => p.value)) / mauStart) * 100 : null, "pct",
    "Agen yang menjadi dormant dalam rentang / agen aktif di awal rentang.");

  const roleDates = raw.snapshot.filter((r) => r.metric_key === "users_by_role" && r.snapshot_date <= to).map((r) => r.snapshot_date).sort();
  const lastRoleDate = roleDates[roleDates.length - 1];
  const roles = lastRoleDate
    ? raw.snapshot.filter((r) => r.metric_key === "users_by_role" && r.snapshot_date === lastRoleDate).map((r) => ({ role: r.dimension, count: r.value })).sort((a, b) => b.count - a.count)
    : null;

  // Retensi kohort: enam bulan kalender berakhir di bulan `to`.
  const toMonth = monthOf(to);
  const cohorts: CohortRow[] = [];
  for (let i = 5; i >= 0; i--) {
    const cm = addMonths(toMonth, -i);
    const retention: (number | null)[] = [];
    let size: number | null = null;
    for (let k = 0; k < 6; k++) {
      const target = addMonths(cm, k);
      const date = target === toMonth ? to : monthEnd(target);
      if (date > to) { retention.push(null); continue; }
      const sz = raw.cohortRows.find((r) => r.metric_key === "cohort_size" && r.dimension === cm && r.snapshot_date === date)?.value;
      const ac = raw.cohortRows.find((r) => r.metric_key === "cohort_active_30d" && r.dimension === cm && r.snapshot_date === date)?.value;
      if (k === 0 && sz !== undefined) size = sz;
      retention.push(sz && ac !== undefined ? (ac / sz) * 100 : null);
    }
    cohorts.push({ cohort: cm, size, retention });
  }

  const snapDates = raw.snapshot.map((r) => r.snapshot_date).sort();
  const notes: string[] = [
    "Tren agen suspended per hari dan organisasi ditutup per hari tidak ditampilkan (keputusan v1). Take rate tidak dipakai.",
    "Metrik stok (agen aktif, DAU/WAU, organisasi aktif, subscriber, MRR, retensi kohort) hanya punya riwayat sejak snapshot harian berjalan.",
  ];
  if (snapDates.length === 0) notes.push("Belum ada snapshot harian: metrik stok kosong sampai job harian berjalan.");

  return {
    generated_at: raw.generatedAt,
    definition_version: DEFINITION_VERSION,
    range: { from, to, days: daysInRange(from, to) },
    previous: prev,
    series,
    tiles,
    roles,
    funnel: raw.funnel,
    cohorts,
    snapshot: { first_date: snapDates[0] ?? null, last_date: snapDates[snapDates.length - 1] ?? null },
    notes,
    unavailable: [
      { key: "listings_rejected", label: "Listing ditolak moderasi", reason: "Tidak ada timestamp penolakan di data listing." },
      { key: "subscription_churn", label: "Churn langganan", reason: "Status berakhir tanpa perpanjangan tidak tercatat terstruktur; butuh definisi status langganan yang baku." },
      { key: "gmv_property", label: "GMV nilai jual-beli properti", reason: "Transaksi properti terjadi di luar platform dan tidak tercatat." },
    ],
  };
}

// ---------------------------------------------------------------- pengambilan data

async function fetchAllSnapshot(supabase: SupabaseClient, keys: readonly string[], from: string, to: string, extra?: { dates?: string[]; dims?: string[] }): Promise<SnapshotRow[]> {
  const out: SnapshotRow[] = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    let q = supabase.from("metrics_daily_snapshot").select("snapshot_date,metric_key,dimension,value").in("metric_key", [...keys]).order("snapshot_date").order("metric_key").order("dimension").range(offset, offset + PAGE - 1);
    if (extra?.dates) q = q.in("snapshot_date", extra.dates);
    else q = q.gte("snapshot_date", from).lte("snapshot_date", to);
    if (extra?.dims) q = q.in("dimension", extra.dims);
    const { data, error } = await q;
    if (error) throw error;
    for (const r of data ?? []) out.push({ snapshot_date: String(r.snapshot_date), metric_key: String(r.metric_key), dimension: String(r.dimension ?? ""), value: Number(r.value) });
    if (!data || data.length < PAGE) break;
  }
  return out;
}

async function fetchFlow(supabase: SupabaseClient, from: string, to: string): Promise<Map<string, Map<string, number>>> {
  const { data, error } = await supabase.rpc("admin_analytics_flow", { p_from: from, p_to: to });
  if (error) throw error;
  const map = new Map<string, Map<string, number>>();
  for (const r of (data ?? []) as { m_key: string; m_day: string; m_value: string | number }[]) {
    const inner = map.get(r.m_key) ?? new Map<string, number>();
    inner.set(String(r.m_day).slice(0, 10), Number(r.m_value));
    map.set(r.m_key, inner);
  }
  return map;
}

async function fetchFunnel(supabase: SupabaseClient, to: string): Promise<FunnelResult | null> {
  const prevMonth = addMonths(monthOf(to), -1);
  const cohortFrom = monthStart(prevMonth), cohortTo = monthEnd(prevMonth);
  const { data, error } = await supabase.rpc("admin_analytics_funnel", { p_cohort_from: cohortFrom, p_cohort_to: cohortTo });
  if (error) throw error;
  const row = (data as Record<string, string | number | null>[] | null)?.[0];
  if (!row) return null;
  const registered = Number(row.registered ?? 0);
  const steps = [
    { key: "registered", label: "Daftar", count: registered },
    { key: "verified", label: "Terverifikasi", count: Number(row.verified ?? 0) },
    { key: "first_listing", label: "Listing pertama dipublikasikan", count: Number(row.first_listing ?? 0) },
    { key: "first_lead", label: "Lead pertama", count: Number(row.first_lead ?? 0) },
    { key: "first_payment", label: "Pembayaran pertama", count: Number(row.first_payment ?? 0) },
  ].map((s) => ({ ...s, pct: registered > 0 ? (s.count / registered) * 100 : null }));
  return { cohort_from: cohortFrom, cohort_to: cohortTo, steps, median_days_to_first_lead: row.median_days_to_first_lead === null || row.median_days_to_first_lead === undefined ? null : Number(row.median_days_to_first_lead) };
}

export async function loadDashboard(supabase: SupabaseClient, params: { from: string; to: string; compare: boolean }): Promise<Dashboard> {
  const { from, to, compare } = params;
  const prev = compare ? previousRange(from, to) : null;
  const [cur, pre, snapshot, funnel] = await Promise.all([
    fetchFlow(supabase, from, to),
    prev ? fetchFlow(supabase, prev.from, prev.to) : Promise.resolve(null),
    fetchAllSnapshot(supabase, STOCK_KEYS, prev ? prev.from : from, to),
    fetchFunnel(supabase, to),
  ]);

  const toMonth = monthOf(to);
  const cohortMonths = Array.from({ length: 6 }, (_, i) => addMonths(toMonth, -(5 - i)));
  const dates = new Set<string>();
  for (const cm of cohortMonths) for (let k = 0; k < 6; k++) {
    const target = addMonths(cm, k);
    const d = target === toMonth ? to : monthEnd(target);
    if (d <= to) dates.add(d);
  }
  const cohortRows = dates.size ? await fetchAllSnapshot(supabase, ["cohort_size", "cohort_active_30d"], from, to, { dates: [...dates], dims: cohortMonths }) : [];

  return assembleDashboard({ from, to, compare, flow: { current: cur, previous: pre }, snapshot, funnel, cohortRows, generatedAt: new Date().toISOString() });
}
