// lib/analytics/agent-stats.ts
// Perakitan data "Statistik Saya" (analitik agen), sisi baca dari migration
// 0125. Dua cakupan:
//   - own          : data agen sendiri (+ perbandingan anonim, min. 30 agen)
//   - organization : hanya pemimpin aktif organisasi; agregat per anggota,
//                    TANPA learning/DBR (privasi anggota)
// Otorisasi ada di DB (R-02): RPC 0125 menolak dengan 42501 (dipetakan
// handler menjadi 403) bila peran tidak boleh membaca, atau pemanggil bukan
// pemimpin aktif organisasi yang diminta. Kode ini tidak mengulang cek itu
// dan tidak memakai service role.
// assembleAgentStats() murni (tanpa I/O) supaya builder export bisa diuji.

import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFINITION_VERSION, type Point, type SeriesResult, type Tile, type Unit } from "./dashboard";
import { enumerateDays, previousRange } from "./period";

export type AgentStatsScope = "own" | "organization";

export interface DailyRow {
  m_key: string;
  m_day: string;
  m_value: number | string;
}

export interface BenchmarkMetric {
  key: "views" | "leads" | "conversion";
  percentile: number;
}
export type Benchmark =
  | { available: false; sample_size: number; min_sample: number }
  | { available: true; sample_size: number; min_sample: number; metrics: BenchmarkMetric[] };

export interface MemberRow {
  name: string;
  is_leader: boolean;
  is_self: boolean;
  active_listings: number;
  views: number;
  leads: number;
  refresh: number;
}

/** Bentuk jsonb agent_statistics_summary (0125); bagian own/org saling eksklusif. */
export interface AgentSummary {
  listing_status: Record<string, number>;
  lead_pipeline: Record<string, number>;
  active_listings: number;
  stale_listings: number;
  top_listings: { listing_id: string; title: string; status: string; views: number; leads: number }[];
  quota?: { has_pool: boolean; allowance: number; used_today: number };
  entitlements?: { type: string; capacity: number | null; ends_at: string | null }[];
  learning?: { courses_in_progress: number; avg_progress_percent: number | null; points_balance: number; certificates_total: number; awards_active: number };
  dbr?: { total: number; layak: number; perlu_review: number; tidak_layak: number; saved_prospects: number; shared: number };
  members?: MemberRow[];
}

export interface AgentStats {
  scope: AgentStatsScope;
  organization_id: string | null;
  range: { from: string; to: string; days: number };
  previous: { from: string; to: string } | null;
  generated_at: string;
  definition_version: string;
  series: SeriesResult[];
  tiles: Tile[];
  summary: AgentSummary;
  benchmark: Benchmark | null; // null pada cakupan organisasi
  notes: string[];
}

interface SeriesDef {
  key: string;
  label: string;
  group: SeriesResult["group"];
  unit: Unit;
  ownOnly?: boolean;
  note?: string;
}

const SERIES: SeriesDef[] = [
  { key: "views", label: "Dilihat", group: "marketplace", unit: "int", note: "Jumlah tampilan halaman listing (semua listing dalam cakupan)." },
  { key: "leads", label: "Lead", group: "marketplace", unit: "int", note: "Klik CTA WhatsApp pada listing." },
  { key: "refresh_used", label: "Refresh terpakai", group: "aktivitas", unit: "int", note: "Pemakaian kuota refresh listing." },
  { key: "points_earned", label: "Poin learning diperoleh", group: "learning", unit: "int", ownOnly: true },
  { key: "dbr_simulations", label: "Simulasi DBR", group: "aktivitas", unit: "int", ownOnly: true },
];

const num = (v: number | string | undefined): number => (v === undefined ? 0 : Number(v));
const sum = (pts: Point[]): number => pts.reduce((a, p) => a + p.value, 0);
const deltaPct = (cur: number, prev: number): number | null => (prev === 0 ? null : ((cur - prev) / prev) * 100);

function fill(rows: DailyRow[], key: string, days: string[]): Point[] {
  const byDay = new Map<string, number>();
  for (const r of rows) if (r.m_key === key) byDay.set(r.m_day, (byDay.get(r.m_day) ?? 0) + num(r.m_value));
  return days.map((day) => ({ day, value: byDay.get(day) ?? 0 }));
}

export interface AgentStatsRaw {
  scope: AgentStatsScope;
  organizationId: string | null;
  from: string;
  to: string;
  compare: boolean;
  current: DailyRow[];
  previous: DailyRow[] | null;
  summary: AgentSummary;
  benchmark: Benchmark | null;
  generatedAt: string;
}

export function assembleAgentStats(raw: AgentStatsRaw): AgentStats {
  const days = enumerateDays(raw.from, raw.to);
  const prev = raw.compare ? previousRange(raw.from, raw.to) : null;
  const prevDays = prev ? enumerateDays(prev.from, prev.to) : null;
  const own = raw.scope === "own";

  const series: SeriesResult[] = SERIES.filter((d) => own || !d.ownOnly).map((d) => {
    const current = fill(raw.current, d.key, days);
    const previous = prevDays && raw.previous ? fill(raw.previous, d.key, prevDays) : null;
    const value = sum(current);
    const previousValue = previous ? sum(previous) : null;
    return {
      key: d.key, label: d.label, group: d.group, kind: "flow", unit: d.unit,
      current, previous, value, previous_value: previousValue,
      delta_pct: previousValue === null ? null : deltaPct(value, previousValue),
      ...(d.note ? { note: d.note } : {}),
    };
  });

  const views = series.find((s) => s.key === "views")?.value ?? 0;
  const leads = series.find((s) => s.key === "leads")?.value ?? 0;
  const tiles: Tile[] = [
    { key: "conversion_pct", label: "Konversi lead per tayangan", group: "marketplace", unit: "pct", value: views > 0 ? (leads / views) * 100 : null, ...(views > 0 ? {} : { note: "Belum ada tayangan pada periode ini." }) },
  ];

  const notes = [
    "Tanggal = tanggal kalender WIB.",
    own
      ? "Semua angka hanya milik akun Anda."
      : "Statistik organisasi hanya menampilkan angka listing, lead, dan kuota per anggota. Data learning dan simulasi DBR anggota tidak ditampilkan.",
    ...(own ? ["Perbandingan anonim dihitung dari agen yang punya minimal satu listing terbit; identitas agen lain tidak pernah ditampilkan."] : []),
  ];

  return {
    scope: raw.scope,
    organization_id: raw.organizationId,
    range: { from: raw.from, to: raw.to, days: days.length },
    previous: prev,
    generated_at: raw.generatedAt,
    definition_version: DEFINITION_VERSION,
    series,
    tiles,
    summary: raw.summary,
    benchmark: raw.benchmark,
    notes,
  };
}

async function rpcRows<T>(supabase: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export async function loadAgentStats(
  supabase: SupabaseClient,
  params: { from: string; to: string; compare: boolean; organizationId?: string | undefined },
): Promise<AgentStats> {
  const { from, to, compare } = params;
  const organizationId = params.organizationId ?? null;
  const scope: AgentStatsScope = organizationId ? "organization" : "own";
  const prev = compare ? previousRange(from, to) : null;
  const args = (f: string, t: string) => ({ p_from: f, p_to: t, p_organization_id: organizationId });

  const [current, previous, summary, benchmark] = await Promise.all([
    rpcRows<DailyRow[]>(supabase, "agent_statistics_daily", args(from, to)),
    prev ? rpcRows<DailyRow[]>(supabase, "agent_statistics_daily", args(prev.from, prev.to)) : Promise.resolve(null),
    rpcRows<AgentSummary>(supabase, "agent_statistics_summary", args(from, to)),
    scope === "own" ? rpcRows<Benchmark>(supabase, "agent_statistics_benchmark", { p_from: from, p_to: to }) : Promise.resolve(null),
  ]);

  return assembleAgentStats({ scope, organizationId, from, to, compare, current, previous, summary, benchmark, generatedAt: new Date().toISOString() });
}
