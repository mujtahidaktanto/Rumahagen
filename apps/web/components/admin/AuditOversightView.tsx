// components/admin/AuditOversightView.tsx — Audit & Oversight (M09, wireframe 02-Admin/M09-Audit-Oversight): tab Audit Log (Superadmin+Admin saja, RLS audit_logs_select) dan tab Antrean
// Review Agent (semua role admin, RLS users_select_manager_agent_rows/self_or_admin sudah cukup untuk role='agent'). Tab dan filter murni lewat query string (?tab=&entity_type=&action=&
// user_id=&page=) — TIDAK ada JS klien untuk ini (form GET biasa), supaya bisa dibagikan/ditandai. Hanya tombol Export CSV yang butuh interaktivitas klien (lihat ExportAuditCsvButton).
import Link from "next/link";
import type { Route } from "next";
import { ExportAuditCsvButton } from "@/components/admin/ExportAuditCsvButton";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { CheckCircleIcon } from "@/components/ui/icons";
import type { AgentReviewRow, AuditLogFilters, AuditLogRow } from "@/lib/admin/audit-data";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

function tabHref(tab: "audit" | "review"): Route {
  return `/admin/audit?tab=${tab}` as Route;
}

function pageHref(tab: "audit", filters: AuditLogFilters, page: number): Route {
  const params = new URLSearchParams({ tab });
  if (filters.entityType) params.set("entity_type", filters.entityType);
  if (filters.action) params.set("action", filters.action);
  if (filters.userId) params.set("user_id", filters.userId);
  params.set("page", String(page));
  return `/admin/audit?${params.toString()}` as Route;
}

export function AuditOversightView({
  viewerRole,
  tab,
  filters,
  page,
  auditPage,
  reviewQueue,
}: {
  viewerRole: AdminViewerRole;
  tab: "audit" | "review";
  filters: AuditLogFilters;
  page: number;
  auditPage: Part<{ rows: AuditLogRow[]; total: number; hasMore: boolean }> | null;
  reviewQueue: Part<AgentReviewRow[]> | null;
}) {
  const isSuperadmin = viewerRole === "superadmin";
  const isAuditAllowed = viewerRole === "superadmin" || viewerRole === "admin";

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Audit &amp; Oversight</h1>
        {tab === "audit" && isSuperadmin ? <ExportAuditCsvButton entityType={filters.entityType} action={filters.action} userId={filters.userId} /> : null}
      </div>

      <div className="flex gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={tabHref("audit")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "audit" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Audit Log
        </Link>
        <Link href={tabHref("review")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "review" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Antrean Review Agent
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "audit" ? (
          !isAuditAllowed ? (
            <p className="py-16 text-center text-body-md text-ink-500">Audit Log hanya untuk Admin+Superadmin — Manager tidak diberi grant `m09.administrative_audit_log.view` sama sekali.</p>
          ) : !auditPage?.ok ? (
            <ErrorState title="Audit log gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <form method="GET" className="flex flex-wrap gap-2.5">
                <input type="hidden" name="tab" value="audit" />
                <Input name="entity_type" defaultValue={filters.entityType ?? ""} placeholder="entity_type…" className="w-[200px]" />
                <Input name="action" defaultValue={filters.action ?? ""} placeholder="action…" className="w-[200px]" />
                <Input name="user_id" defaultValue={filters.userId ?? ""} placeholder="user_id (uuid)…" className="w-[220px]" />
                <Button type="submit" variant="secondary">
                  Filter
                </Button>
              </form>

              <Table>
                <THead>
                  <TR>
                    <TH>Waktu</TH>
                    <TH>Aksi</TH>
                    <TH>Entitas</TH>
                    <TH>Aktor</TH>
                    <TH>Organisasi</TH>
                    <TH>Perubahan</TH>
                  </TR>
                </THead>
                <TBody>
                  {auditPage.data.rows.length === 0 ? (
                    <TR>
                      <TD colSpan={6} className="py-12 text-center text-body-md text-ink-300">
                        Tidak ada entri audit log yang cocok dengan filter ini.
                      </TD>
                    </TR>
                  ) : (
                    auditPage.data.rows.map((a) => (
                      <TR key={a.id}>
                        <TD className="text-body-md text-ink-500">{a.createdAt}</TD>
                        <TD>
                          <span className="font-mono text-[12px] text-label-lg">{a.action}</span>
                        </TD>
                        <TD className="text-body-md">{a.entityType ?? "—"}</TD>
                        <TD className="text-body-md">{a.actor}</TD>
                        <TD className="text-body-md text-ink-500">{a.organization}</TD>
                        <TD>
                          <span className="block max-w-[260px] truncate font-mono text-caption" title={a.changeSummary}>
                            {a.changeSummary}
                          </span>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>

              <div className="flex items-center justify-between">
                <span className="text-caption">
                  Menampilkan {auditPage.data.rows.length} dari {auditPage.data.total} entri.
                </span>
                <div className="flex gap-2.5">
                  {page > 1 ? (
                    <LinkButton href={pageHref("audit", filters, page - 1)} variant="secondary" size="sm">
                      Sebelumnya
                    </LinkButton>
                  ) : null}
                  {auditPage.data.hasMore ? (
                    <LinkButton href={pageHref("audit", filters, page + 1)} variant="secondary" size="sm">
                      Berikutnya
                    </LinkButton>
                  ) : null}
                </div>
              </div>
              <p className="text-caption">Read-only — audit_logs append-only, tidak ada aksi ubah/hapus sama sekali (satu-satunya jalur tulis: fungsi log_audit_event() dipanggil modul lain).</p>
            </>
          )
        ) : !reviewQueue?.ok ? (
          <ErrorState title="Antrean review gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            <p className="text-body-md text-ink-500">
              Antrean EXCEPTION saja — alur normal M02 review langsung auto-approved sejak keputusan produk 0083 (tidak ada gate pending). Baris di sini seharusnya jarang/kosong.
            </p>
            {reviewQueue.data.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-ink-300">
                <CheckCircleIcon size={44} />
                <span className="text-body-md">Tidak ada review pending — sesuai ekspektasi (jalur normal tidak melewati antrean ini).</span>
              </div>
            ) : (
              <>
                <Table>
                  <THead>
                    <TR>
                      <TH>Nama</TH>
                      <TH>Email</TH>
                      <TH>Status</TH>
                      <TH>Terdaftar</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {reviewQueue.data.map((r) => (
                      <TR key={r.id}>
                        <TD className="text-label-lg">{r.name}</TD>
                        <TD className="text-body-md text-ink-500">{r.email ?? "—"}</TD>
                        <TD>
                          <Badge tone="warning">Ditinjau</Badge>
                        </TD>
                        <TD className="text-body-md text-ink-500">{dtf.format(new Date(r.createdAt))}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
                <span className="text-caption">Aksi (ubah role/suspend) ada di Direktori Pengguna — layar ini murni antrean pengawasan.</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
