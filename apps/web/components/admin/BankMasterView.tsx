// components/admin/BankMasterView.tsx — Bank Master (M07, wireframe 02-Admin/M07-Bank-Master): tab Daftar Bank (semua bank termasuk inactive — beda dari kalkulator DBR Agent yang hanya
// menampilkan bank aktif) dan tab Oversight Simulasi DBR (read-only, filter agent_id lewat query string, tanpa JS klien untuk navigasinya sendiri — pola sama seperti Audit & Oversight).
import Link from "next/link";
import type { Route } from "next";
import { BankRowActions } from "@/components/admin/BankRowActions";
import { CreateBankDialog } from "@/components/admin/CreateBankDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { BankRow, DbrSimRow, EligibilityStatus } from "@/lib/admin/bank-master-data";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

const ELIGIBILITY_LABEL: Record<EligibilityStatus, string> = { layak: "Layak", perlu_review: "Perlu Review", tidak_layak: "Tidak Layak" };
const ELIGIBILITY_TONE: Record<EligibilityStatus, "success" | "warning" | "danger"> = { layak: "success", perlu_review: "warning", tidak_layak: "danger" };

export function BankMasterView({
  tab,
  canConfigure,
  banks,
  agentIdFilter,
  simulations,
}: {
  tab: "banks" | "oversight";
  canConfigure: boolean;
  banks: Part<BankRow[]>;
  agentIdFilter?: string;
  simulations: Part<DbrSimRow[]> | null;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Bank Master</h1>
        {tab === "banks" && canConfigure ? <CreateBankDialog /> : null}
      </div>

      <div className="flex gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={"/admin/bank?tab=banks" as Route} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "banks" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Daftar Bank
        </Link>
        <Link href={"/admin/bank?tab=oversight" as Route} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "oversight" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Oversight Simulasi DBR
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "banks" ? (
          !banks.ok ? (
            <ErrorState title="Data bank gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : banks.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada bank terdaftar. Tambahkan bank pertama agar Agent bisa memakai Kalkulator DBR.</p>
          ) : (
            <>
              <p className="text-body-md text-ink-500">Melihat SEMUA bank termasuk 'inactive' (beda dari kalkulator DBR agent yang hanya menampilkan bank aktif untuk dipilih).</p>
              <Table>
                <THead>
                  <TR>
                    <TH>Nama Bank</TH>
                    <TH>Ambang DBR</TH>
                    <TH>Bunga Default</TH>
                    <TH>Status</TH>
                    <TH>Aksi</TH>
                  </TR>
                </THead>
                <TBody>
                  {banks.data.map((b) => (
                    <TR key={b.id}>
                      <TD className="text-label-lg">{b.name}</TD>
                      <TD className="text-body-md">{b.dbrThresholdPercent}%</TD>
                      <TD className="text-body-md">{b.defaultInterestRate}%</TD>
                      <TD>
                        <Badge tone={b.status === "active" ? "success" : "neutral"}>{b.status === "active" ? "Aktif" : "Nonaktif"}</Badge>
                      </TD>
                      <TD>{canConfigure ? <BankRowActions bank={b} /> : null}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </>
          )
        ) : !simulations?.ok ? (
          <ErrorState title="Data simulasi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            <form method="GET" className="flex gap-2.5">
              <input type="hidden" name="tab" value="oversight" />
              <Input name="agent_id" defaultValue={agentIdFilter ?? ""} placeholder="Filter berdasarkan agent_id (uuid)…" className="w-[280px]" />
              <Button type="submit" variant="secondary">
                Filter
              </Button>
            </form>
            <Table>
              <THead>
                <TR>
                  <TH>Agent</TH>
                  <TH>Bank</TH>
                  <TH>Prospek</TH>
                  <TH>DBR</TH>
                  <TH>Kelayakan</TH>
                  <TH>Dibuat</TH>
                </TR>
              </THead>
              <TBody>
                {simulations.data.length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="py-12 text-center text-body-md text-ink-300">
                      Tidak ada simulasi yang cocok.
                    </TD>
                  </TR>
                ) : (
                  simulations.data.map((s) => (
                    <TR key={s.id}>
                      <TD className="text-body-md">{s.agentName}</TD>
                      <TD className="text-body-md">{s.bankName}</TD>
                      <TD className="text-body-md text-ink-500">{s.prospectName ?? "—"}</TD>
                      <TD className="text-label-lg">{s.dbrPercent}%</TD>
                      <TD>
                        <Badge tone={ELIGIBILITY_TONE[s.eligibilityStatus]}>{ELIGIBILITY_LABEL[s.eligibilityStatus]}</Badge>
                      </TD>
                      <TD className="text-body-md text-ink-500">{dtf.format(new Date(s.createdAt))}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
            <span className="text-caption">Menampilkan {simulations.data.length} simulasi terbaru (dibatasi 200 baris).</span>
          </>
        )}
      </div>
    </div>
  );
}
