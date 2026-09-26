// components/agent/DbrResultCard.tsx — kartu hasil DBR (M07): angka DBR besar, status kelayakan, bilah pengukur dengan penanda ambang bank, plafon, cicilan per bulan, bank, tenor, dan bunga. Presentasi murni
// (dipakai Kalkulator, Detail Riwayat, dan halaman berbagi untuk prospek); tanpa data pribadi selain yang diberikan pemanggil. Angka berasal dari server, tidak dihitung ulang di sini.
import { Badge } from "@/components/ui/Badge";
import { eligibility, formatPercent, gaugePercent, tenorLabel } from "@/lib/agent/dbr-rules";
import { formatDate, formatRupiah } from "@/lib/format";

export type DbrResultData = {
  dbrPercent: number;
  thresholdUsed: number;
  eligibilityStatus: string;
  loanAmount: number;
  monthlyInstallment: number;
  bankName: string;
  tenorMonths: number;
  interestRateAnnual: number;
  propertyPrice: number;
  downPayment: number;
  createdAt?: string;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm bg-ink-50 p-3">
      <dt className="text-caption">{label}</dt>
      <dd className="text-title-md break-words">{value}</dd>
    </div>
  );
}

export function DbrResultCard({ result }: { result: DbrResultData }) {
  const el = eligibility(result.eligibilityStatus);
  const bar = { layak: "bg-success-600", perlu_review: "bg-warning-600", tidak_layak: "bg-danger-600" }[result.eligibilityStatus] ?? "bg-ink-300";
  return (
    <section aria-label="Hasil DBR" className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption">DBR (Debt Burden Ratio)</p>
          <p className={`text-display ${el.color}`}>{formatPercent(result.dbrPercent)}</p>
        </div>
        <Badge tone={el.tone}>{el.label}</Badge>
      </div>

      <div>
        <div
          role="meter"
          aria-label="DBR terhadap ambang bank"
          aria-valuemin={0}
          aria-valuemax={50}
          aria-valuenow={Math.min(50, result.dbrPercent)}
          aria-valuetext={`${formatPercent(result.dbrPercent)}, ambang bank ${formatPercent(result.thresholdUsed)}`}
          className="relative h-3 w-full overflow-hidden rounded-pill bg-ink-100"
        >
          <div className={`h-full rounded-pill ${bar}`} style={{ width: `${gaugePercent(result.dbrPercent)}%` }} />
          <span aria-hidden="true" className="absolute top-0 h-full w-0.5 bg-ink-900" style={{ left: `${gaugePercent(result.thresholdUsed)}%` }} />
        </div>
        <p className="mt-1.5 text-caption">
          Ambang bank: {formatPercent(result.thresholdUsed)}
          {result.createdAt ? ` · Disimulasikan ${formatDate(result.createdAt)}` : ""}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Stat label="Plafon Pinjaman" value={formatRupiah(result.loanAmount)} />
        <Stat label="Cicilan/Bulan" value={formatRupiah(result.monthlyInstallment)} />
        <Stat label="Bank" value={result.bankName} />
        <Stat label="Tenor · Bunga" value={`${tenorLabel(result.tenorMonths)} · ${formatPercent(result.interestRateAnnual)}/thn`} />
        <Stat label="Harga Properti" value={formatRupiah(result.propertyPrice)} />
        <Stat label="Uang Muka" value={formatRupiah(result.downPayment)} />
      </dl>
    </section>
  );
}
