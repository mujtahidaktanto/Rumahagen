// components/admin/AwardingPathAdminView.tsx — Jalur Penghargaan (M15, wireframe 02-Admin/M15-Awarding-Path-Admin): 3 tab — Title Definitions, Awarding Path & Versi, Cakupan Otoritas.
// Ketiganya Superadmin/Admin/Manager penuh (view+manage, tidak ada pembedaan seperti layar M15/M07 lain — RLS FOR ALL/publik yang sama untuk SELECT dan WRITE).
import Link from "next/link";
import type { Route } from "next";
import { CreatePathDialog } from "@/components/admin/CreatePathDialog";
import { CreateScopeDialog } from "@/components/admin/CreateScopeDialog";
import { CreateTitleDialog } from "@/components/admin/CreateTitleDialog";
import { PathCardActions } from "@/components/admin/PathCardActions";
import { ScopeRowActions } from "@/components/admin/ScopeRowActions";
import { TitleRowActions } from "@/components/admin/TitleRowActions";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { AwardingPathRow, PathVersionStatus, ScopeStatus, TitleAuthorityScopeRow, TitleDefRow, TitleStatus } from "@/lib/admin/awarding-path-data";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

const TITLE_STATUS_LABEL: Record<TitleStatus, string> = { draft: "Draft", active: "Aktif", inactive: "Nonaktif", retired: "Retired" };
const TITLE_STATUS_TONE: Record<TitleStatus, "neutral" | "success" | "warning" | "danger"> = { draft: "neutral", active: "success", inactive: "warning", retired: "danger" };
const VERSION_STATUS_LABEL: Record<PathVersionStatus, string> = { draft: "Draft", active: "Aktif", retired: "Retired" };
const VERSION_STATUS_TONE: Record<PathVersionStatus, "neutral" | "success" | "danger"> = { draft: "neutral", active: "success", retired: "danger" };
const SCOPE_STATUS_LABEL: Record<ScopeStatus, string> = { active: "Aktif", inactive: "Nonaktif" };
const SCOPE_STATUS_TONE: Record<ScopeStatus, "success" | "neutral"> = { active: "success", inactive: "neutral" };

type Tab = "titles" | "paths" | "scope";

function tabHref(tab: Tab): Route {
  return `/admin/jalur-penghargaan?tab=${tab}` as Route;
}

function effectiveRange(from: string | null, to: string | null): string {
  if (from && to) return `${dtf.format(new Date(from))} – ${dtf.format(new Date(to))}`;
  if (from) return `Sejak ${dtf.format(new Date(from))}`;
  if (to) return `Sampai ${dtf.format(new Date(to))}`;
  return "—";
}

export function AwardingPathAdminView({
  tab,
  titles,
  paths,
  scopes,
}: {
  tab: Tab;
  titles: Part<TitleDefRow[]>;
  paths: Part<AwardingPathRow[]>;
  scopes: Part<TitleAuthorityScopeRow[]>;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Jalur Penghargaan</h1>
        {tab === "titles" ? <CreateTitleDialog /> : null}
        {tab === "paths" && titles.ok ? <CreatePathDialog titles={titles.data} /> : null}
        {tab === "scope" && titles.ok ? <CreateScopeDialog titles={titles.data} /> : null}
      </div>

      <div className="flex flex-wrap gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={tabHref("titles")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "titles" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Title Definitions
        </Link>
        <Link href={tabHref("paths")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "paths" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Awarding Path &amp; Versi
        </Link>
        <Link href={tabHref("scope")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "scope" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Cakupan Otoritas
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "titles" ? (
          !titles.ok ? (
            <ErrorState title="Data title gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : titles.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada title. Mulai dengan menambahkan title baru, lalu hubungkan ke awarding path.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Kode</TH>
                  <TH>Nama Title</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {titles.data.map((t) => (
                  <TR key={t.id}>
                    <TD className="font-mono text-[12.5px]">{t.code}</TD>
                    <TD className="text-label-lg">{t.name}</TD>
                    <TD>
                      <Badge tone={TITLE_STATUS_TONE[t.status]}>{TITLE_STATUS_LABEL[t.status]}</Badge>
                    </TD>
                    <TD>
                      <TitleRowActions title={t} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )
        ) : tab === "paths" ? (
          !paths.ok ? (
            <ErrorState title="Data awarding path gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="text-body-md text-ink-500">
                Rule Version TIDAK punya endpoint list global — hanya ditemukan lewat rujukan yang sudah ditautkan ke versi path, ditampilkan di dalam kartu versi masing-masing.
              </p>
              {paths.data.length === 0 ? (
                <p className="py-12 text-center text-body-md text-ink-300">Belum ada awarding path.</p>
              ) : (
                paths.data.map((p) => (
                  <div key={p.id} className="rounded-md border border-ink-100 bg-white p-4">
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-title-md">{p.name}</span> <span className="font-mono text-caption">({p.code})</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Badge tone="neutral">{p.status}</Badge>
                        <PathCardActions path={p} />
                      </div>
                    </div>
                    <span className="text-caption">Untuk title: {p.titleName}</span>
                    {p.versions.length === 0 ? (
                      <p className="mt-2 text-caption text-ink-300">Belum ada versi.</p>
                    ) : (
                      <div className="mt-2 flex flex-col">
                        {p.versions.map((v) => (
                          <div key={v.id} className="flex items-center gap-3 border-b border-ink-50 py-2.5 last:border-b-0">
                            <span className="text-label-lg">v{v.versionNo}</span>
                            <Badge tone={VERSION_STATUS_TONE[v.status]}>{VERSION_STATUS_LABEL[v.status]}</Badge>
                            <span className="flex-1 text-caption">
                              {effectiveRange(v.effectiveFrom, v.effectiveTo)} · rule: {v.ruleLabel ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )
        ) : !scopes.ok ? (
          <ErrorState title="Data cakupan otoritas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <>
            {scopes.data.length === 0 ? (
              <p className="py-16 text-center text-body-md text-ink-300">Belum ada cakupan otoritas.</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Title</TH>
                    <TH>Tipe Scope</TH>
                    <TH>Rujukan</TH>
                    <TH>Status</TH>
                    <TH>Aksi</TH>
                  </TR>
                </THead>
                <TBody>
                  {scopes.data.map((s) => (
                    <TR key={s.id}>
                      <TD className="text-body-md">{s.titleName}</TD>
                      <TD className="font-mono text-[12.5px]">{s.scopeType}</TD>
                      <TD className="text-body-md text-ink-500">{s.scopeReference ?? "—"}</TD>
                      <TD>
                        <Badge tone={SCOPE_STATUS_TONE[s.status]}>{SCOPE_STATUS_LABEL[s.status]}</Badge>
                      </TD>
                      <TD>
                        <ScopeRowActions scope={s} />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
            <p className="text-caption">Terpisah dari operational permission (Role/Preset) — mengatur SIAPA/APA yang berwenang men-award title tertentu, bukan RBAC biasa.</p>
          </>
        )}
      </div>
    </div>
  );
}
