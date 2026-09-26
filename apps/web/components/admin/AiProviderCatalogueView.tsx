// components/admin/AiProviderCatalogueView.tsx — Provider AI (M13, wireframe 02-Admin/M13-Provider-Catalogue): tab Katalog Provider (GET terbuka semua role admin, mutasi Superadmin-only)
// dan tab Koneksi Agent (Superadmin-only sepenuhnya untuk MELIHAT — beda dari kesan wireframe bahwa staf lain bisa lihat tapi tidak Force Action; RLS agent_ai_connections_select hanya
// memberi Superadmin grant m13.own_byok_connection.view scope 'all').
import Link from "next/link";
import type { Route } from "next";
import { AiProviderRowActions } from "@/components/admin/AiProviderRowActions";
import { CreateAiProviderDialog } from "@/components/admin/CreateAiProviderDialog";
import { ForceAiConnectionDialog } from "@/components/admin/ForceAiConnectionDialog";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { AiConnectionAdminRow, AiProviderAdminRow } from "@/lib/admin/ai-provider-admin-data";
import { AI_BILLING_LABEL, AI_CONNECTION_STATUS_LABEL, AI_CONNECTION_STATUS_TONE } from "@/lib/agent/ai-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

type Tab = "catalogue" | "conn";

function tabHref(tab: Tab): Route {
  return `/admin/provider-ai?tab=${tab}` as Route;
}

export function AiProviderCatalogueView({
  isSuperadmin,
  tab,
  providers,
  connections,
}: {
  isSuperadmin: boolean;
  tab: Tab;
  providers: Part<AiProviderAdminRow[]>;
  connections: Part<AiConnectionAdminRow[]> | null;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Provider AI</h1>
          <p className="text-caption">Mutasi katalog Superadmin-only</p>
        </div>
        {tab === "catalogue" && isSuperadmin ? <CreateAiProviderDialog /> : null}
      </div>

      <div className="flex gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={tabHref("catalogue")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "catalogue" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Katalog Provider
        </Link>
        <Link href={tabHref("conn")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "conn" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Koneksi Agent
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "catalogue" ? (
          !providers.ok ? (
            <ErrorState title="Katalog provider gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : providers.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada provider AI. Tambahkan provider pertama agar Agent bisa menghubungkan akun AI mereka.</p>
          ) : (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Provider</TH>
                    <TH>Kode</TH>
                    <TH>Model Billing</TH>
                    <TH>Status</TH>
                    <TH>Aksi</TH>
                  </TR>
                </THead>
                <TBody>
                  {providers.data.map((p) => (
                    <TR key={p.id}>
                      <TD className="text-label-lg">{p.displayName}</TD>
                      <TD className="font-mono text-[12.5px]">{p.code}</TD>
                      <TD className="text-body-md">{AI_BILLING_LABEL[p.billingType]}</TD>
                      <TD>
                        <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status === "active" ? "Aktif" : "Nonaktif"}</Badge>
                      </TD>
                      <TD>{isSuperadmin ? <AiProviderRowActions provider={p} /> : null}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <p className="text-caption">GET katalog terbuka untuk role manapun yang lolos autentikasi (dipakai layar Koneksi AI agent) — mutasi (create/edit/disable/enable/retire) murni Superadmin.</p>
            </>
          )
        ) : !isSuperadmin ? (
          <p className="py-16 text-center text-body-md text-ink-500">
            Koneksi Agent hanya untuk Superadmin — RLS `agent_ai_connections_select` hanya memberi Superadmin akses lihat lintas agent (Admin/Manager tidak diberi grant permission ini sama
            sekali).
          </p>
        ) : !connections?.ok ? (
          <ErrorState title="Data koneksi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            <p className="text-body-md text-ink-500">agent_ai_connections lintas agent — force-intervention (revoke/disconnect/disable) tetap Superadmin-only, dibungkus fungsi admin_force_provider_connection().</p>
            <Table>
              <THead>
                <TR>
                  <TH>Agent</TH>
                  <TH>Provider</TH>
                  <TH>Status</TH>
                  <TH>Terhubung</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {connections.data.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="py-12 text-center text-body-md text-ink-300">
                      Belum ada koneksi AI.
                    </TD>
                  </TR>
                ) : (
                  connections.data.map((c) => (
                    <TR key={c.id}>
                      <TD className="text-body-md">{c.agentName}</TD>
                      <TD className="text-body-md">{c.providerName}</TD>
                      <TD>
                        <Badge tone={AI_CONNECTION_STATUS_TONE[c.status]}>{AI_CONNECTION_STATUS_LABEL[c.status]}</Badge>
                      </TD>
                      <TD className="text-body-md text-ink-500">{dtf.format(new Date(c.connectedAt))}</TD>
                      <TD>
                        <ForceAiConnectionDialog connectionId={c.id} agentName={c.agentName} />
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
