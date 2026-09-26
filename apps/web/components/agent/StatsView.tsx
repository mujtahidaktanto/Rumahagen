// components/agent/StatsView.tsx — Statistik Saya (M08, wireframe 01-Agent/M08-Statistik-Saya), server-render: rentang dan perbandingan lewat URL, tab Milik Saya / Organisasi (hanya pemimpin), ringkasan, grafik, listing
// terbaik, pipeline lead, kondisi listing, kuota refresh, learning & DBR, perbandingan anonim, dan performa organisasi. Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Angka dari RPC agent_statistics_*
// (lib/analytics/agent-stats.ts); cakupan organisasi hanya menghitung listing berorganisasi itu (migration 0162). Yang belum dicatat sistem dinyatakan terang-terangan di bagian "Yang belum tersedia".
import Link from "next/link";
import type { Route } from "next";
import { BarList, Kpi, SparkCard } from "@/components/agent/StatsCharts";
import { StatsExport } from "@/components/agent/StatsExport";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { entitlementExpiry, entitlementLabel } from "@/lib/agent/commercial-rules";
import { BENCH_LABEL, MAX_CUSTOM_DAYS, RANGE_CHIPS, compareLabel, conversion, dbrRows, exportHref, listingStatusRows, pct1, pipelineRows, rangeLabel, refreshUsage, statsHref, type StatsState } from "@/lib/agent/stats-view";
import type { AgentStats } from "@/lib/analytics/agent-stats";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

const nf = new Intl.NumberFormat("id-ID");
type Org = { id: string; name: string };
type Quota = { has_pool: boolean; allowance: number; used_today: number; default_daily?: number; extra_daily?: number; stock_remaining?: number };

function Card({ title, note, children, className }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5", className)}>
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

export function StatsView({ stats, state, leaderOrgs }: { stats: AgentStats | null; state: StatsState; leaderOrgs: Org[] }) {
  const org = leaderOrgs.find((o) => o.id === state.org) ?? null;
  const scopeLabel = org ? `Organisasi ${org.name} (semua anggota)` : "Milik saya";
  const range = rangeLabel(state.from, state.to);
  const cmp = compareLabel(state.compare ? previousOf(state) : null);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Statistik Saya</h1>
        <StatsExport
          hrefs={{ xlsx: exportHref(state, "xlsx"), pdf: exportHref(state, "pdf") }}
          scopeLabel={scopeLabel}
          rangeText={range}
          compareText={cmp}
        />
      </div>

      {leaderOrgs.length > 0 ? (
        <nav aria-label="Cakupan" className="flex flex-wrap items-center gap-2">
          <Link href={statsHref(state, { org: null }) as Route} aria-current={!org ? "page" : undefined} className={chip(!org)}>
            Milik Saya
          </Link>
          {leaderOrgs.map((o) => (
            <Link key={o.id} href={statsHref(state, { org: o.id }) as Route} aria-current={org?.id === o.id ? "page" : undefined} className={chip(org?.id === o.id)}>
              Organisasi{leaderOrgs.length > 1 ? `: ${o.name}` : ""}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Rentang" className="flex flex-wrap gap-2">
            {RANGE_CHIPS.map((c) => (
              <Link
                key={c.key}
                href={statsHref(state, { rentang: c.key, ...(c.key === "kustom" ? { dari: state.dari || state.from, sampai: state.sampai || state.to } : {}) }) as Route}
                aria-current={state.rentang === c.key || (state.customInvalid && c.key === "kustom") ? "page" : undefined}
                className={chip(state.rentang === c.key)}
              >
                {c.label}
              </Link>
            ))}
          </nav>
          <Link href={statsHref(state, { compare: !state.compare }) as Route} role="switch" aria-checked={state.compare} className="flex min-h-11 items-center gap-2 text-label-lg text-ink-700 no-underline hover:no-underline">
            <span aria-hidden="true" className={cn("relative h-6 w-11 rounded-pill transition-colors", state.compare ? "bg-blue-600" : "bg-ink-300")}>
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", state.compare ? "left-[22px]" : "left-0.5")} />
            </span>
            Bandingkan periode sebelumnya
          </Link>
        </div>
        {state.rentang === "kustom" || state.customInvalid ? (
          <form method="get" action="/agent/statistik" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="rentang" value="kustom" />
            {!state.compare ? <input type="hidden" name="bandingkan" value="0" /> : null}
            {org ? (
              <>
                <input type="hidden" name="cakupan" value="organisasi" />
                <input type="hidden" name="org" value={org.id} />
              </>
            ) : null}
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
                Rentang kustom tidak valid (tanggal harus nyata, awal tidak setelah akhir, hari ini paling akhir, maksimal {MAX_CUSTOM_DAYS} hari). Menampilkan 30 hari terakhir.
              </p>
            ) : null}
          </form>
        ) : null}
        <p className="text-caption">
          {range} · {cmp}
        </p>
      </div>

      {!stats ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Statistik gagal dimuat" message={org ? "Statistik organisasi hanya untuk pemimpin aktif; atau terjadi gangguan. Muat ulang, atau pilih Milik Saya." : "Terjadi gangguan saat mengambil statistik. Muat ulang beberapa saat lagi."} />
          <div className="flex justify-center pb-10">
            <LinkButton href={statsHref(state) as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : isEmpty(stats) ? (
        <div className="rounded-md bg-white">
          <EmptyState title="Belum ada data statistik" message="Statistik muncul setelah listing Anda dipublikasikan dan mulai dilihat pengunjung." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/listing/baru" as Route} size="sm">
              Buat Listing
            </LinkButton>
          </div>
        </div>
      ) : stats.scope === "organization" ? (
        <OrgBody stats={stats} state={state} />
      ) : (
        <OwnBody stats={stats} state={state} />
      )}
    </div>
  );
}

function previousOf(s: StatsState) {
  const n = Math.round((Date.parse(`${s.to}T00:00:00Z`) - Date.parse(`${s.from}T00:00:00Z`)) / 86_400_000) + 1;
  const to = new Date(Date.parse(`${s.from}T00:00:00Z`) - 86_400_000);
  const from = new Date(to.getTime() - (n - 1) * 86_400_000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

const seriesOf = (s: AgentStats, key: string) => s.series.find((x) => x.key === key);
const nums = (pts: { value: number }[] | null | undefined) => (pts ? pts.map((p) => p.value) : null);

function isEmpty(s: AgentStats): boolean {
  const total = (k: string) => seriesOf(s, k)?.value ?? 0;
  return total("views") === 0 && total("leads") === 0 && total("refresh_used") === 0 && s.summary.active_listings === 0 && Object.values(s.summary.listing_status).every((n) => !n);
}

function OwnBody({ stats, state }: { stats: AgentStats; state: StatsState }) {
  const sm = stats.summary;
  const views = seriesOf(stats, "views");
  const leads = seriesOf(stats, "leads");
  const refresh = seriesOf(stats, "refresh_used");
  const conv = stats.tiles.find((t) => t.key === "conversion_pct");
  const days = { from: stats.range.from, to: stats.range.to };
  const q = sm.quota as Quota | undefined;
  const use = q ? refreshUsage(q) : null;
  const spark = (title: string, sub: string, s: typeof views) =>
    s ? <SparkCard title={title} sub={sub} value={nf.format(s.value ?? 0)} current={nums(s.current) ?? []} previous={nums(s.previous)} days={days} delta={s.delta_pct} showDelta={state.compare} /> : null;

  return (
    <>
      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Listing Aktif" value={nf.format(sm.active_listings)} hint="Jumlah saat ini" />
        <Kpi label="Dilihat" value={nf.format(views?.value ?? 0)} delta={views?.delta_pct} showDelta={state.compare} />
        <Kpi label="Lead Masuk" value={nf.format(leads?.value ?? 0)} delta={leads?.delta_pct} showDelta={state.compare} />
        <Kpi label="Konversi Dilihat ke Lead" value={pct1(conv?.value ?? conversion(leads?.value ?? 0, views?.value ?? 0))} hint={conv?.note ?? "Lead dibagi dilihat"} />
      </section>

      <Card title="Performa Listing" note="Dilihat = kunjungan ke halaman listing publik Anda. Konversi = lead dibagi dilihat.">
        <div className="grid gap-4 md:grid-cols-2">
          {spark("Dilihat", "Kunjungan ke halaman listing Anda", views)}
          {spark("Lead Masuk", "Klik tombol WhatsApp di listing Anda", leads)}
        </div>
        <div className="overflow-x-auto">
          <h3 className="mb-2 text-label-lg">Listing terbaik</h3>
          {sm.top_listings.length === 0 ? (
            <p className="text-body-md text-ink-500">Belum ada listing dengan tayangan atau lead pada rentang ini.</p>
          ) : (
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-ink-100 text-caption">
                  <th className="py-2 pr-3 font-bold">Listing</th>
                  <th className="px-3 py-2 text-right font-bold">Dilihat</th>
                  <th className="px-3 py-2 text-right font-bold">Lead</th>
                  <th className="py-2 pl-3 text-right font-bold">Konversi</th>
                </tr>
              </thead>
              <tbody>
                {sm.top_listings.map((l) => (
                  <tr key={l.listing_id} className="border-b border-ink-50">
                    <td className="max-w-[320px] py-2.5 pr-3 text-body-md">
                      <Link href={`/agent/listing/${l.listing_id}` as Route} className="break-words">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right text-body-md">{nf.format(l.views)}</td>
                    <td className="px-3 py-2.5 text-right text-body-md">{nf.format(l.leads)}</td>
                    <td className="py-2.5 pl-3 text-right text-body-md">{pct1(conversion(l.leads, l.views))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Lead" note="Status lead yang Anda perbarui sendiri di Listing Saya. Waktu respons belum bisa dihitung karena perubahan status tidak menyimpan waktunya.">
          <h3 className="text-label-lg">Pipeline lead (periode ini)</h3>
          <BarList rows={pipelineRows(sm.lead_pipeline)} showPercent empty="Belum ada lead pada rentang ini." />
        </Card>
        <Card title="Kondisi listing" note="Jumlah saat ini. Riwayat harian jumlah listing aktif belum tersimpan.">
          <BarList rows={listingStatusRows(sm.listing_status)} empty="Belum ada listing." />
          {sm.stale_listings > 0 ? <p className="rounded-sm bg-warning-100 p-3 text-body-md">{nf.format(sm.stale_listings)} listing belum di-refresh lebih dari 7 hari.</p> : null}
        </Card>
      </div>

      <Card title="Kuota Refresh" note="Refresh menaikkan posisi listing. Jatah harian dari sistem, bonus, dan add-on aktif.">
        {use && q?.has_pool ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-body-md">Terpakai hari ini</span>
              <span className="text-label-lg">
                {nf.format(use.used)} / {nf.format(use.allow)}
              </span>
            </div>
            <div role="meter" aria-label="Refresh terpakai hari ini" aria-valuemin={0} aria-valuemax={use.allow} aria-valuenow={Math.min(use.used, use.allow)} className="h-2.5 overflow-hidden rounded-pill bg-ink-100">
              <div className={cn("h-full rounded-pill", use.pct >= 100 ? "bg-danger-600" : use.pct >= 80 ? "bg-warning-600" : "bg-blue-600")} style={{ width: `${use.pct}%` }} />
            </div>
            {q.stock_remaining !== undefined ? <p className="text-caption">Saldo add-on: {nf.format(q.stock_remaining)} refresh (dipakai setelah jatah harian habis; tidak kedaluwarsa).</p> : null}
          </div>
        ) : (
          <p className="text-body-md text-ink-500">Anda belum punya jatah refresh harian.</p>
        )}
        {(sm.entitlements ?? []).length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sm.entitlements!.map((e, i) => (
              <li key={`${e.type}-${i}`} className="text-body-md">
                {entitlementLabel(e.type)}
                {e.capacity !== null ? ` · ${nf.format(e.capacity)}` : ""}
                <span className="text-caption"> · {entitlementExpiry({ ends_at: e.ends_at, lifecycle_status: "active" }, formatDate)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {spark("Refresh terpakai", "Jumlah refresh per hari pada rentang ini", refresh)}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {sm.learning ? (
          <Card title="Learning" note="Ringkasan belajar Anda saat ini.">
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Kursus berjalan", nf.format(sm.learning.courses_in_progress)],
                ["Rata-rata progres", sm.learning.avg_progress_percent === null ? "—" : `${nf.format(sm.learning.avg_progress_percent)}%`],
                ["Saldo Learning Points", nf.format(sm.learning.points_balance)],
                ["Sertifikat", nf.format(sm.learning.certificates_total)],
                ["Penghargaan aktif", nf.format(sm.learning.awards_active)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-sm bg-ink-50 p-3">
                  <dt className="text-caption">{l}</dt>
                  <dd className="text-title-md">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ) : null}
        {sm.dbr ? (
          <Card title="Kalkulator DBR" note="Hasil simulasi DBR pada rentang ini.">
            <BarList rows={dbrRows(sm.dbr)} showPercent empty="Belum ada simulasi." />
            <p className="text-caption">
              Disimpan sebagai prospek: {nf.format(sm.dbr.saved_prospects)} · Dibagikan ke prospek: {nf.format(sm.dbr.shared)}
            </p>
          </Card>
        ) : null}
      </div>

      <Card title="Posisi Anda dibanding agen lain" note="Perbandingan anonim dengan agen aktif lain. Tidak ada nama atau angka agen lain yang ditampilkan.">
        {stats.benchmark?.available ? (
          <>
            <ul className="flex flex-col gap-3">
              {stats.benchmark.metrics.map((m) => (
                <li key={m.key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-body-md">{BENCH_LABEL[m.key] ?? m.key}</span>
                    <span className="text-label-lg">Lebih tinggi dari {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(m.percentile)}% agen</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-pill bg-ink-100" aria-hidden="true">
                    <div className="h-full rounded-pill bg-blue-600" style={{ width: `${Math.min(100, m.percentile)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-caption">Dibandingkan dengan {nf.format(stats.benchmark.sample_size)} agen aktif dalam rentang yang sama.</p>
          </>
        ) : (
          <p className="text-body-md text-ink-500">Perbandingan belum tersedia: jumlah agen pembanding belum mencukupi (minimal {stats.benchmark?.min_sample ?? 30} agen aktif) agar tetap anonim.</p>
        )}
      </Card>

      <Unavailable notes={stats.notes} />
    </>
  );
}

function OrgBody({ stats, state }: { stats: AgentStats; state: StatsState }) {
  const sm = stats.summary;
  const views = seriesOf(stats, "views");
  const leads = seriesOf(stats, "leads");
  const members = sm.members ?? [];
  const days = { from: stats.range.from, to: stats.range.to };
  return (
    <>
      <section aria-label="Ringkasan organisasi" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Anggota aktif" value={nf.format(members.length)} />
        <Kpi label="Listing aktif organisasi" value={nf.format(sm.active_listings)} hint="Hanya listing atas nama organisasi" />
        <Kpi label="Dilihat (organisasi)" value={nf.format(views?.value ?? 0)} delta={views?.delta_pct} showDelta={state.compare} />
        <Kpi label="Lead (organisasi)" value={nf.format(leads?.value ?? 0)} delta={leads?.delta_pct} showDelta={state.compare} />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {views ? <SparkCard title="Dilihat" sub="Listing atas nama organisasi" value={nf.format(views.value ?? 0)} current={nums(views.current) ?? []} previous={nums(views.previous)} days={days} delta={views.delta_pct} showDelta={state.compare} /> : null}
        {leads ? <SparkCard title="Lead Masuk" sub="Listing atas nama organisasi" value={nf.format(leads.value ?? 0)} current={nums(leads.current) ?? []} previous={nums(leads.previous)} days={days} delta={leads.delta_pct} showDelta={state.compare} /> : null}
      </div>

      <Card title="Performa Organisasi" note="Hanya untuk pemimpin organisasi. Menampilkan aktivitas listing organisasi tiap anggota; listing pribadi dan data pribadi anggota tidak ditampilkan.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-ink-100 text-caption">
                <th className="py-2 pr-3 font-bold">Anggota</th>
                <th className="px-3 py-2 text-right font-bold">Listing aktif</th>
                <th className="px-3 py-2 text-right font-bold">Dilihat</th>
                <th className="px-3 py-2 text-right font-bold">Lead</th>
                <th className="px-3 py-2 text-right font-bold">Konversi</th>
                <th className="py-2 pl-3 text-right font-bold">Refresh</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={`${m.name}-${i}`} className="border-b border-ink-50">
                  <td className="py-2.5 pr-3 text-body-md">
                    <span className="break-words">{m.name}</span>
                    {m.is_self ? <span className="text-caption"> (Anda)</span> : null}
                    {m.is_leader ? <Badge tone="info" className="ml-2">Pemimpin</Badge> : null}
                  </td>
                  <td className="px-3 py-2.5 text-right text-body-md">{nf.format(m.active_listings)}</td>
                  <td className="px-3 py-2.5 text-right text-body-md">{nf.format(m.views)}</td>
                  <td className="px-3 py-2.5 text-right text-body-md">{nf.format(m.leads)}</td>
                  <td className="px-3 py-2.5 text-right text-body-md">{pct1(conversion(m.leads, m.views))}</td>
                  <td className="py-2.5 pl-3 text-right text-body-md">{nf.format(m.refresh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-caption">Refresh = pemakaian jatah refresh tiap anggota (jatah melekat pada orangnya, bukan pada listing), sehingga bisa mencakup listing pribadi anggota.</p>
      </Card>
      <Unavailable notes={stats.notes} />
    </>
  );
}

function Unavailable({ notes }: { notes: string[] }) {
  return (
    <Card title="Yang belum tersedia">
      <p className="text-body-md text-ink-700">Kunjungan ke profil publik, sumber trafik dan demografi pengunjung, waktu respons ke lead, lead yang menjadi transaksi, dan tren jumlah listing aktif per hari belum bisa ditampilkan karena datanya belum dicatat sistem.</p>
      {notes.length > 0 ? (
        <ul className="list-disc pl-5 text-caption">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
