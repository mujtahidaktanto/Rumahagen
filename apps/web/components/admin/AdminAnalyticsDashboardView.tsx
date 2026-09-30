// components/admin/AdminAnalyticsDashboardView.tsx — Dashboard Analytics (M09, wireframe 02-Admin/M09-Dashboard-Analytics), server-render (nol JavaScript klien, sama pola
// dengan Statistik Saya Agent): rentang dan perbandingan lewat URL, KPI ringkas, grafik per kelompok metrik (Pengguna & Agen/Marketplace/Organisasi/Learning/Komersial/
// Aktivitas/Risiko), sebaran peran pengguna, funnel kohort bulan lalu, dan tabel retensi kohort 6 bulan. Metrik ARUS (RPC admin_analytics_flow) selalu terisi dari data
// operasional; metrik STOK (tabel metrics_daily_snapshot) kosong sampai pemanggil harian `capture_daily_metrics` berjalan (belum ada, lihat audit/FRONTEND_GAPS.md) — dikomunikasikan
// lewat catatan bawaan `dashboard.notes`, bukan status "gagal". Export (Excel/PDF) hanya untuk Superadmin (m09.administrative_export.export, dicek pemanggil DAN server).
import Link from "next/link";
import type { Route } from "next";
import { AnalyticsExport } from "@/components/admin/AnalyticsExport";
import { BarList, Kpi, SparkCard, type BarRow } from "@/components/admin/AnalyticsCharts";
import { ErrorState } from "@/components/ui/States";
import { analyticsHref, compareLabel, dateLabel, exportHref, formatUnit, previousOf, rangeLabel, RANGE_CHIPS, type AnalyticsState } from "@/lib/admin/analytics-view";
import { GROUP_LABELS, GROUP_ORDER, GROUP_NOTES, type Dashboard, type GroupId } from "@/lib/analytics/dashboard";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const nf = new Intl.NumberFormat("id-ID");

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <div>
        <h2 className="text-title-md">{title}</h2>
        {note ? <p className="text-caption">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

const chip = (active: boolean) =>
  cn(
    "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
    active ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
  );

export function AdminAnalyticsDashboardView({ dashboard, state, canExport }: { dashboard: Dashboard | null; state: AnalyticsState; canExport: boolean }) {
  const range = rangeLabel(state.from, state.to);
  const cmp = compareLabel(state.compare ? previousOf(state) : null);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Dashboard Analytics</h1>
          <p className="text-caption">
            Definisi metrik {dashboard?.definition_version ?? "v1.1"} ·{" "}
            {dashboard?.snapshot.last_date ? `Snapshot terakhir ${dateLabel(dashboard.snapshot.last_date)}` : "Belum ada snapshot harian"}
          </p>
        </div>
        {canExport ? <AnalyticsExport hrefs={{ xlsx: exportHref(state, "xlsx"), pdf: exportHref(state, "pdf") }} rangeText={range} compareText={cmp} /> : null}
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Rentang" className="flex flex-wrap gap-2">
            {RANGE_CHIPS.map((c) => (
              <Link
                key={c.key}
                href={analyticsHref(state, { rentang: c.key, ...(c.key === "kustom" ? { dari: state.dari || state.from, sampai: state.sampai || state.to } : {}) }) as Route}
                aria-current={state.rentang === c.key || (state.customInvalid && c.key === "kustom") ? "page" : undefined}
                className={chip(state.rentang === c.key)}
              >
                {c.label}
              </Link>
            ))}
          </nav>
          <Link href={analyticsHref(state, { compare: !state.compare }) as Route} role="switch" aria-checked={state.compare} className="flex min-h-11 items-center gap-2 text-label-lg text-ink-700 no-underline hover:no-underline">
            <span aria-hidden="true" className={cn("relative h-6 w-11 rounded-pill transition-colors", state.compare ? "bg-blue-600" : "bg-ink-300")}>
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", state.compare ? "left-[22px]" : "left-0.5")} />
            </span>
            Bandingkan periode sebelumnya
          </Link>
        </div>
        {state.rentang === "kustom" || state.customInvalid ? (
          <form method="get" action="/admin" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="rentang" value="kustom" />
            {!state.compare ? <input type="hidden" name="bandingkan" value="0" /> : null}
            <label className="flex flex-col gap-1 text-caption">
              Dari
              <input type="date" name="dari" defaultValue={state.dari || state.from} max={state.to} className="h-11 rounded-md border-[1.5px] border-ink-100 px-3 text-body-md text-ink-900" />
            </label>
            <label className="flex flex-col gap-1 text-caption">
              Sampai
              <input type="date" name="sampai" defaultValue={state.sampai || state.to} className="h-11 rounded-md border-[1.5px] border-ink-100 px-3 text-body-md text-ink-900" />
            </label>
            <button type="submit" className="h-11 rounded-md bg-blue-600 px-4 text-label-lg text-white hover:bg-blue-700">
              Terapkan
            </button>
            {state.customInvalid ? (
              <p role="alert" className="basis-full text-caption text-danger-600">
                Rentang kustom tidak valid (tanggal harus nyata, awal tidak setelah akhir, hari ini paling akhir). Menampilkan 30 hari terakhir.
              </p>
            ) : null}
          </form>
        ) : null}
        <p className="text-caption">
          {range} · {cmp}
        </p>
      </div>

      {!dashboard ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Dashboard gagal dimuat" message="Terjadi gangguan saat mengambil data analitik. Muat ulang beberapa saat lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={analyticsHref(state) as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : (
        <Body dashboard={dashboard} state={state} />
      )}
    </div>
  );
}

const nums = (pts: { value: number }[] | null | undefined) => (pts ? pts.map((p) => p.value) : null);

function Body({ dashboard, state }: { dashboard: Dashboard; state: AnalyticsState }) {
  const days = { from: dashboard.range.from, to: dashboard.range.to };
  const seriesByGroup = new Map<GroupId, typeof dashboard.series>();
  for (const s of dashboard.series) seriesByGroup.set(s.group, [...(seriesByGroup.get(s.group) ?? []), s]);

  const funnelRows: BarRow[] = (dashboard.funnel?.steps ?? []).map((s) => ({ key: s.key, label: s.label, count: s.count, share: s.pct ?? 0 }));
  const roleRows: BarRow[] = dashboard.roles
    ? (() => {
        const total = dashboard.roles!.reduce((a, r) => a + r.count, 0);
        return dashboard.roles!.map((r) => ({ key: r.role, label: ROLE_LABEL[r.role as RoleCode] ?? r.role, count: r.count, share: total > 0 ? (r.count / total) * 100 : 0 }));
      })()
    : [];

  return (
    <>
      {dashboard.notes.length > 0 ? (
        <div className="rounded-md border border-warning-200 bg-warning-100 p-3.5 text-body-md text-warning-600">
          <ul className="list-disc pl-5">
            {dashboard.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {dashboard.tiles.map((t) => (
          <Kpi key={t.key} label={t.label} value={formatUnit(t.value, t.unit)} hint={t.note} />
        ))}
      </section>

      {GROUP_ORDER.map((g) => {
        const series = seriesByGroup.get(g) ?? [];
        if (series.length === 0) return null;
        return (
          <Card key={g} title={GROUP_LABELS[g]} note={GROUP_NOTES[g]}>
            <div className="grid gap-4 md:grid-cols-3">
              {series.map((s) => (
                <SparkCard
                  key={s.key}
                  title={s.label}
                  sub={s.note}
                  value={formatUnit(s.value, s.unit)}
                  current={nums(s.current) ?? []}
                  previous={nums(s.previous)}
                  days={days}
                  delta={s.delta_pct}
                  showDelta={state.compare}
                />
              ))}
            </div>
          </Card>
        );
      })}

      {roleRows.length > 0 ? (
        <Card title="Sebaran Peran Pengguna" note="Posisi terkini (snapshot harian terakhir), bukan tren.">
          <BarList rows={roleRows} showPercent empty="Belum ada data." />
        </Card>
      ) : null}

      {dashboard.funnel ? (
        <Card
          title="Funnel Onboarding"
          note={`Kohort daftar ${dateLabel(dashboard.funnel.cohort_from)} – ${dateLabel(dashboard.funnel.cohort_to)} (bulan lalu). Median waktu ke lead pertama: ${dashboard.funnel.median_days_to_first_lead === null ? "—" : `${nf.format(dashboard.funnel.median_days_to_first_lead)} hari`}.`}
        >
          <BarList rows={funnelRows} showPercent empty="Belum ada pendaftar pada kohort ini." />
        </Card>
      ) : null}

      {dashboard.cohorts && dashboard.cohorts.some((c) => c.size !== null) ? (
        <Card title="Retensi Kohort" note="Persentase agen kohort pendaftaran (per bulan) yang masih aktif pada bulan ke-0 sampai ke-5 setelah bergabung.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-ink-100 text-caption">
                  <th className="py-2 pr-3 font-bold">Kohort</th>
                  <th className="px-3 py-2 text-right font-bold">Ukuran</th>
                  {Array.from({ length: 6 }, (_, k) => (
                    <th key={k} className="px-3 py-2 text-right font-bold">
                      Bulan {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.cohorts.map((c) => (
                  <tr key={c.cohort} className="border-b border-ink-50">
                    <td className="py-2.5 pr-3 text-body-md">{c.cohort}</td>
                    <td className="px-3 py-2.5 text-right text-body-md">{c.size === null ? "—" : nf.format(c.size)}</td>
                    {c.retention.map((r, k) => (
                      <td key={k} className="px-3 py-2.5 text-right text-body-md">
                        {r === null ? "—" : formatUnit(r, "pct")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {dashboard.unavailable.length > 0 ? (
        <Card title="Yang belum tersedia">
          <ul className="flex flex-col gap-1.5">
            {dashboard.unavailable.map((u) => (
              <li key={u.key} className="text-body-md text-ink-700">
                <span className="text-label-lg">{u.label}</span> — {u.reason}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
