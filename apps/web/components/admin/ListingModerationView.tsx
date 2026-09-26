// components/admin/ListingModerationView.tsx — Moderasi Listing (M03, wireframe 02-Admin/M03-Moderasi-Listing): 3 tab lewat query string (?tab=pending|leads|published), murni
// server-rendered kecuali dialog aksi per baris (client). "Kontak Prospek" TIDAK ditampilkan di tab Leads — listing_leads (0047) tidak punya kolom kontak sama sekali (log klik CTA saja).
import Link from "next/link";
import type { Route } from "next";
import { PendingListingRowActions } from "@/components/admin/PendingListingRowActions";
import { PublishedListingRowActions } from "@/components/admin/PublishedListingRowActions";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { ListingModerationRow, LeadRow, LeadStatus } from "@/lib/admin/listing-moderation-data";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

const LEAD_STATUS_LABEL: Record<LeadStatus, string> = { new: "Baru", contacted: "Dihubungi", converted: "Konversi", lost: "Hilang" };
const LEAD_STATUS_TONE: Record<LeadStatus, "info" | "warning" | "success" | "neutral"> = { new: "info", contacted: "warning", converted: "success", lost: "neutral" };

type Tab = "pending" | "leads" | "published";

function tabHref(tab: Tab): Route {
  return `/admin/moderasi-listing?tab=${tab}` as Route;
}

export function ListingModerationView({
  viewerRole,
  tab,
  pending,
  published,
  leads,
}: {
  viewerRole: AdminViewerRole;
  tab: Tab;
  pending: Part<ListingModerationRow[]> | null;
  published: Part<ListingModerationRow[]> | null;
  leads: Part<LeadRow[]> | null;
}) {
  const canApprove = viewerRole !== "manager";
  const isSuperadmin = viewerRole === "superadmin";

  return (
    <div className="flex w-full flex-col">
      <div className="p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Moderasi Listing</h1>
      </div>

      <div className="flex flex-wrap gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={tabHref("pending")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Antrean Review Pasca-Publish
        </Link>
        <Link href={tabHref("leads")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "leads" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Leads Lintas Agent
        </Link>
        <Link href={tabHref("published")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "published" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Listing Terbit &amp; Suspend
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "pending" ? (
          !pending?.ok ? (
            <ErrorState title="Antrean review gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="text-body-md text-ink-500">
                Jalur ADMINISTRATIF/EKSEPSIONAL pasca-publish (mis. listing live yang gambarnya melanggar aturan) — BUKAN gate pre-publish. Alur normal M03 tetap draft→publish→published
                tanpa persetujuan apa pun.
              </p>
              {pending.data.length === 0 ? (
                <p className="py-12 text-center text-body-md text-ink-300">Tidak ada listing dalam antrean review.</p>
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Listing</TH>
                      <TH>Agent</TH>
                      <TH>Ditandai</TH>
                      <TH>Aksi</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {pending.data.map((l) => (
                      <TR key={l.id}>
                        <TD className="text-label-lg">{l.title}</TD>
                        <TD className="text-body-md">{l.agentName}</TD>
                        <TD className="text-body-md text-ink-500">{dtf.format(new Date(l.createdAt))}</TD>
                        <TD>
                          <PendingListingRowActions listingId={l.id} title={l.title} canApprove={canApprove} />
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </>
          )
        ) : tab === "leads" ? (
          !isSuperadmin ? (
            <p className="py-16 text-center text-body-md text-ink-500">
              Leads Lintas Agent hanya untuk Superadmin — data kontak calon pembeli dijaga privasinya, tidak dibuka ke Admin/Manager (RLS `listing_leads_select`, migration 0162).
            </p>
          ) : !leads?.ok ? (
            <ErrorState title="Data leads gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="text-body-md text-ink-500">Read-only — semua listing_leads lintas agent (log klik CTA WhatsApp, tanpa data kontak prospek — tabel tidak menyimpannya).</p>
              <Table>
                <THead>
                  <TR>
                    <TH>Listing</TH>
                    <TH>Agent</TH>
                    <TH>Sumber</TH>
                    <TH>Status</TH>
                    <TH>Masuk</TH>
                  </TR>
                </THead>
                <TBody>
                  {leads.data.length === 0 ? (
                    <TR>
                      <TD colSpan={5} className="py-12 text-center text-body-md text-ink-300">
                        Belum ada leads.
                      </TD>
                    </TR>
                  ) : (
                    leads.data.map((ld) => (
                      <TR key={ld.id}>
                        <TD className="max-w-[220px] truncate text-label-lg">{ld.listingTitle}</TD>
                        <TD className="text-body-md">{ld.agentName}</TD>
                        <TD className="text-body-md text-ink-500">{ld.source}</TD>
                        <TD>
                          <Badge tone={LEAD_STATUS_TONE[ld.status]}>{LEAD_STATUS_LABEL[ld.status]}</Badge>
                        </TD>
                        <TD className="text-body-md text-ink-500">{dtf.format(new Date(ld.createdAt))}</TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </>
          )
        ) : !published?.ok ? (
          <ErrorState title="Data listing gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            <p className="text-body-md text-ink-500">
              Temuan pelanggaran pada foto atau isi listing ditangani dengan <strong>suspend seluruh listing</strong> (tidak ada moderasi per foto). Pemeriksaan foto masih manual oleh admin
              pada MVP; deteksi otomatis masuk roadmap berikutnya.
            </p>
            <Table>
              <THead>
                <TR>
                  <TH>Listing</TH>
                  <TH>Agent</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {published.data.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-12 text-center text-body-md text-ink-300">
                      Tidak ada listing terbit atau ditangguhkan.
                    </TD>
                  </TR>
                ) : (
                  published.data.map((p) => (
                    <TR key={p.id}>
                      <TD className="max-w-[280px] truncate text-label-lg">{p.title}</TD>
                      <TD className="text-body-md">{p.agentName}</TD>
                      <TD>
                        <Badge tone={p.status === "published" ? "success" : "danger"}>{p.status === "published" ? "Terbit" : "Ditangguhkan"}</Badge>
                      </TD>
                      <TD>
                        <PublishedListingRowActions listingId={p.id} title={p.title} status={p.status as "published" | "suspended"} canReactivate={canApprove} />
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
