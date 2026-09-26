// components/admin/CommercialReconciliationView.tsx — Komersial & Rekonsiliasi (M14, wireframe 02-Admin/M14-Komersial-Admin): satu daftar kasus rekonsiliasi. Superadmin+Admin penuh
// (view+resolve); Manager tidak diberi grant m14.commercial_administration.manage_commercial_resources sama sekali (beda dari klaim komentar wireframe), jadi ditolak eksplisit.
import { OpenReconciliationCaseDialog } from "@/components/admin/OpenReconciliationCaseDialog";
import { ManualCorrectionZone } from "@/components/admin/ManualCorrectionZone";
import { ReconciliationCaseRowActions } from "@/components/admin/ReconciliationCaseRowActions";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { ReconciliationCaseRow, ReconciliationStatus } from "@/lib/admin/commercial-reconciliation-data";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STATUS_LABEL: Record<ReconciliationStatus, string> = { open: "Terbuka", investigating: "Diselidiki", resolved: "Selesai", rejected: "Ditolak", escalated: "Eskalasi" };
const STATUS_TONE: Record<ReconciliationStatus, "warning" | "info" | "success" | "neutral" | "danger"> = {
  open: "warning",
  investigating: "info",
  resolved: "success",
  rejected: "neutral",
  escalated: "danger",
};

export function CommercialReconciliationView({ viewerRole, cases }: { viewerRole: AdminViewerRole; cases: Part<ReconciliationCaseRow[]> | null }) {
  const canView = viewerRole === "superadmin" || viewerRole === "admin";
  const isSuperadmin = viewerRole === "superadmin";

  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Komersial &amp; Rekonsiliasi</h1>
        {canView ? <OpenReconciliationCaseDialog /> : null}
      </div>

      {!canView ? (
        <p className="py-16 text-center text-body-md text-ink-500">
          Komersial &amp; Rekonsiliasi hanya untuk Admin+Superadmin — Manager tidak diberi grant `m14.commercial_administration.manage_commercial_resources` sama sekali.
        </p>
      ) : !cases?.ok ? (
        <ErrorState title="Kasus rekonsiliasi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          <p className="text-body-md text-ink-500">reconciliation_cases (0076) — Review/Escalate untuk Admin+Superadmin; Manual Correction (zona di bawah) TERPISAH, Superadmin-only.</p>
          {cases.data.length === 0 ? (
            <p className="py-12 text-center text-body-md text-ink-300">Belum ada kasus rekonsiliasi. Kasus muncul saat data pembayaran dan pesanan tidak cocok, atau saat Anda membukanya manual.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>No. Kasus</TH>
                  <TH>Kategori Mismatch</TH>
                  <TH>Status</TH>
                  <TH>Dibuka</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {cases.data.map((c) => (
                  <TR key={c.id}>
                    <TD className="font-mono text-[12.5px]">{c.caseNumber}</TD>
                    <TD className="text-body-md">{c.mismatchCategory}</TD>
                    <TD>
                      <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </TD>
                    <TD className="text-body-md text-ink-500">{dtf.format(new Date(c.openedAt))}</TD>
                    <TD>
                      <ReconciliationCaseRowActions caseId={c.id} caseNumber={c.caseNumber} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          {isSuperadmin ? (
            <ManualCorrectionZone />
          ) : (
            <div className="mt-5 rounded-md border border-ink-100 bg-ink-50 p-4">
              <span className="text-body-md text-ink-500">Manual Correction hanya untuk Superadmin.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
