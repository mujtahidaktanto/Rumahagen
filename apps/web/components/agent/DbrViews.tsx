// components/agent/DbrViews.tsx — layar server DBR Agent (M07): pembungkus Kalkulator (bank kosong/gagal/sukses), Riwayat Simulasi (daftar), dan Detail Simulasi. Empat keadaan per layar: memuat (loading.tsx),
// kosong, gagal, sukses. Bank Master diisi staf (Admin); tanpa bank aktif kalkulator tidak bisa dipakai dan menjelaskannya.
import Link from "next/link";
import type { Route } from "next";
import { DbrActions } from "@/components/agent/DbrActions";
import { DbrCalculator } from "@/components/agent/DbrCalculator";
import { DbrResultCard } from "@/components/agent/DbrResultCard";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { DBR_PAGE_SIZE, type DbrBank, type DbrDetailResult, type DbrSimulation, type Part } from "@/lib/agent/dbr-data";
import { eligibility, formatPercent, prospectLabel } from "@/lib/agent/dbr-rules";
import { cn } from "@/lib/cn";
import { formatDate, formatRupiah } from "@/lib/format";

const nf = new Intl.NumberFormat("id-ID");

export function DbrTabs({ active }: { active: "kalkulator" | "riwayat" }) {
  const tabs = [
    { key: "kalkulator", href: "/agent/dbr", label: "Kalkulator" },
    { key: "riwayat", href: "/agent/dbr/riwayat", label: "Riwayat Simulasi" },
  ] as const;
  return (
    <nav aria-label="Kalkulator DBR" className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href as Route}
          aria-current={t.key === active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
            t.key === active ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">{children}</div>;

export function DbrCalculatorView({ banks }: { banks: Part<DbrBank[]> }) {
  return (
    <Shell>
      <h1 className="text-headline">Kalkulator DBR</h1>
      <DbrTabs active="kalkulator" />
      {!banks.ok ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Daftar bank gagal dimuat" message="Terjadi gangguan saat mengambil data bank. Belum ada simulasi yang dihitung." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/dbr" as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : banks.data.length === 0 ? (
        <div className="rounded-md bg-white">
          <EmptyState title="Belum ada bank yang tersedia" message="Kalkulator memakai data bank (ambang DBR dan bunga) yang diatur tim RumahAgen. Coba lagi nanti." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/dbr/riwayat" as Route} variant="secondary" size="sm">
              Lihat Riwayat Simulasi
            </LinkButton>
          </div>
        </div>
      ) : (
        <DbrCalculator banks={banks.data} />
      )}
    </Shell>
  );
}

export function DbrHistoryView({ history, tampil }: { history: Part<{ items: DbrSimulation[]; total: number }>; tampil: number }) {
  const h = history.ok ? history.data : null;
  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Riwayat Simulasi DBR</h1>
        <LinkButton href={"/agent/dbr" as Route}>+ Simulasi Baru</LinkButton>
      </div>
      <DbrTabs active="riwayat" />
      {!h ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Riwayat gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/dbr/riwayat" as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : h.items.length === 0 ? (
        <div className="rounded-md bg-white">
          <EmptyState title="Belum ada simulasi DBR" message="Simulasi yang Anda hitung akan tersimpan di sini." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/dbr" as Route} size="sm">
              Mulai Hitung DBR
            </LinkButton>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {h.items.map((s) => {
              const el = eligibility(s.eligibilityStatus);
              return (
                <li key={s.id}>
                  <Link href={`/agent/dbr/riwayat/${s.id}` as Route} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-label-lg break-words">{prospectLabel(s.prospectName, s.prospectPhone)}</span>
                      <span className="text-caption break-words">
                        {formatRupiah(s.propertyPrice)} · {s.bankName} · {formatDate(s.createdAt)}
                      </span>
                    </div>
                    <span className="text-title-md">{formatPercent(s.dbrPercent)}</span>
                    <Badge tone={el.tone}>{el.label}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col items-center gap-2.5 pt-1">
            <span className="text-caption">
              Menampilkan {h.items.length} dari {nf.format(h.total)} simulasi
            </span>
            {h.items.length < h.total ? (
              <LinkButton href={`/agent/dbr/riwayat?tampil=${tampil + DBR_PAGE_SIZE}` as Route} variant="secondary">
                Muat Lebih Banyak
              </LinkButton>
            ) : null}
          </div>
        </>
      )}
    </Shell>
  );
}

export function DbrDetailView({ result, id }: { result: Exclude<DbrDetailResult, { state: "not_found" }>; id: string }) {
  return (
    <Shell>
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
        <Link href={"/agent/dbr/riwayat" as Route} className="text-ink-500">
          Riwayat Simulasi DBR
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink-900">
          Detail
        </span>
      </nav>
      {result.state === "error" ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Simulasi gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={`/agent/dbr/riwayat/${id}` as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <h1 className="text-headline break-words">{prospectLabel(result.simulation.prospectName, result.simulation.prospectPhone)}</h1>
            <DbrResultCard result={result.simulation} />
          </div>
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2 rounded-md border border-ink-100 bg-white p-5">
              <h2 className="text-title-md">Data Simulasi</h2>
              <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
                <dt className="text-caption">Penghasilan Bersih/Bulan</dt>
                <dd className="text-body-md">{formatRupiah(result.simulation.netIncome)}</dd>
                <dt className="text-caption">Cicilan Berjalan</dt>
                <dd className="text-body-md">{result.simulation.existingInstallments > 0 ? formatRupiah(result.simulation.existingInstallments) : "Tidak ada"}</dd>
              </dl>
              <p className="text-caption">Data ini hanya terlihat oleh Anda; halaman berbagi untuk prospek tidak menampilkannya.</p>
            </section>
            <DbrActions simulation={result.simulation} />
          </div>
        </div>
      )}
    </Shell>
  );
}
