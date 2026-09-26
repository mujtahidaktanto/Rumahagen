// components/agent/StatsCharts.tsx — grafik ringan Statistik Saya: kartu garis SVG (periode ini + pembanding putus-putus) dan daftar bilah horizontal. Tanpa pustaka grafik (server-render, nol JavaScript klien).
// Skala vertikal bermula dari 0. Tiap grafik punya teks alternatif ringkas (total, puncak, rentang) untuk pembaca layar; angka pembanding hanya ditampilkan bila diminta.
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { dateLabel, deltaView, sparkGeometry, type BarRow } from "@/lib/agent/stats-view";

const nf = new Intl.NumberFormat("id-ID");
const W = 320;
const H = 90;

export function SparkCard({
  title,
  sub,
  value,
  current,
  previous,
  days,
  delta,
  showDelta,
}: {
  title: string;
  sub?: string;
  /** Angka besar (sudah diformat). */
  value: string;
  current: number[];
  previous: number[] | null;
  /** Tanggal awal dan akhir (YYYY-MM-DD) untuk label sumbu dan teks alternatif. */
  days: { from: string; to: string };
  delta: number | null;
  showDelta: boolean;
}) {
  const g = sparkGeometry(current, previous, W, H);
  const d = showDelta ? deltaView(delta) : null;
  const peak = current.length > 0 ? Math.max(...current) : 0;
  const total = current.reduce((a, b) => a + b, 0);
  const alt = `Grafik ${title}, ${dateLabel(days.from)} sampai ${dateLabel(days.to)}: total ${nf.format(total)}, puncak harian ${nf.format(peak)}${previous ? ", dengan garis pembanding periode sebelumnya" : ""}.`;
  return (
    <section className="flex flex-col gap-2 rounded-md border border-ink-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-label-lg">{title}</h3>
          {sub ? <p className="text-caption">{sub}</p> : null}
        </div>
        {d ? <Badge tone={d.tone}>{d.text}</Badge> : null}
      </div>
      <p className="text-headline">{value}</p>
      {g.line ? (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} preserveAspectRatio="none" className="h-24 w-full overflow-visible text-blue-600">
          <path d={g.area} className="fill-blue-600/10" />
          {g.prev ? <path d={g.prev} fill="none" strokeDasharray="4 3" strokeWidth="1.5" className="stroke-ink-300" vectorEffect="non-scaling-stroke" /> : null}
          <path d={g.line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <p className="py-8 text-center text-caption">Belum ada data pada rentang ini.</p>
      )}
      <div className="flex justify-between text-caption">
        <span>{dateLabel(days.from, false)}</span>
        <span>{dateLabel(days.to, false)}</span>
      </div>
      {previous ? <p className="text-caption">Garis putus-putus = periode sebelumnya.</p> : null}
    </section>
  );
}

const TONE_BAR: Record<BadgeTone, string> = { neutral: "bg-ink-300", warning: "bg-warning-600", success: "bg-success-600", danger: "bg-danger-600", info: "bg-blue-600" };

/** Daftar bilah: label, jumlah, dan (opsional) persen dari total. `showPercent` = tampilkan share sebagai persen; selain itu share hanya lebar bilah. */
export function BarList({ rows, showPercent = false, empty }: { rows: BarRow[]; showPercent?: boolean; empty: string }) {
  if (rows.length === 0) return <p className="text-body-md text-ink-500">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-body-md break-words">{r.label}</span>
            <span className="flex-none text-label-lg">
              {nf.format(r.count)}
              {showPercent ? <span className="ml-1.5 text-caption">{new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(r.share)}%</span> : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-ink-100" aria-hidden="true">
            <div className={cn("h-full rounded-pill", TONE_BAR[r.tone ?? "info"])} style={{ width: `${Math.max(r.count > 0 ? 2 : 0, r.share)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Kpi({ label, value, delta, showDelta, hint }: { label: string; value: string; delta?: number | null; showDelta?: boolean; hint?: string }) {
  const d = showDelta ? deltaView(delta ?? null) : null;
  return (
    <div className="flex flex-col gap-1 rounded-md border border-ink-100 bg-white p-4">
      <p className="text-caption">{label}</p>
      <p className="text-headline">{value}</p>
      {d ? <Badge tone={d.tone} className="self-start">{d.text}</Badge> : null}
      {hint ? <p className="text-caption">{hint}</p> : null}
    </div>
  );
}
