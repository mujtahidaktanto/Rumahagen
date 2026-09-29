"use client";

// components/admin/DeveloperProjectAdminView.tsx — Proyek Developer (M06, wireframe 02-Admin/M06-Developer-Project-Admin): oversight staf, 2 tab (Proyek, Developer Partner). Developer Partner
// mengelola proyeknya sendiri lewat layar Proyek Saya (Fase F) — layar ini untuk staf (Superadmin/Admin/Manager, semuanya punya m06.developer_project.manage/publish dan m06.developer_partner.manage).
// "use client" WAJIB: meneruskan prop fungsi `trigger` ke CreateProjectDialog/PartnerFormDialog/ProjectStatusDialog/LinkPartnerAccountDialog (bukti staging 2026-09-30, digest 606953783 — lihat SystemConfigView.tsx).
import Link from "next/link";
import type { Route } from "next";
import { CreateProjectDialog } from "@/components/admin/CreateProjectDialog";
import { LinkPartnerAccountDialog } from "@/components/admin/LinkPartnerAccountDialog";
import { PartnerFormDialog } from "@/components/admin/PartnerFormDialog";
import { ProjectStatusDialog } from "@/components/admin/ProjectStatusDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { PartnerRow, ProjectRow } from "@/lib/admin/developer-admin-data";
import { CATEGORY_LABEL, TRANSACTION_LABEL, partnerStatus, projectStatus, unlinkedDeveloperPartnerUsers } from "@/lib/admin/developer-admin-rules";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";

export type DeveloperTab = "projects" | "partners";
const TABS: { key: DeveloperTab; label: string }[] = [
  { key: "projects", label: "Proyek" },
  { key: "partners", label: "Developer Partner" },
];

export function DeveloperProjectAdminView({ tab, projects, partners, users }: { tab: DeveloperTab; projects: Part<ProjectRow[]>; partners: Part<PartnerRow[]>; users: Part<DirectoryUserRow[]> }) {
  const partnerList = partners.ok ? partners.data : [];
  const unlinked = users.ok && partners.ok ? unlinkedDeveloperPartnerUsers(users.data, partners.data) : [];

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Proyek Developer</h1>
          <p className="text-caption">Oversight staf; Developer Partner mengelola proyeknya sendiri lewat layar Proyek Saya (Fase F).</p>
        </div>
        <div className="flex gap-2">
          {tab === "projects" ? <CreateProjectDialog partners={partnerList} trigger={(open) => <Button onClick={open} disabled={partnerList.length === 0}>+ Buat Proyek (atas nama Developer)</Button>} /> : null}
          {tab === "partners" ? <PartnerFormDialog trigger={(open) => <Button onClick={open}>+ Tambah Developer Partner</Button>} /> : null}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-ink-100 px-4 lg:px-8">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/proyek-developer?tab=${t.key}` as Route} className={`flex-none border-b-2 py-3.5 text-label-lg font-bold no-underline hover:no-underline ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "projects" ? (
          !projects.ok ? (
            <ErrorState title="Proyek gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : projects.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada proyek developer.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-ink-100 bg-white">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-ink-100 text-caption">
                    <th className="p-3 font-bold">Proyek</th>
                    <th className="p-3 font-bold">Developer</th>
                    <th className="p-3 font-bold">Kategori</th>
                    <th className="p-3 font-bold">Lokasi</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.data.map((p) => {
                    const st = projectStatus(p.status);
                    return (
                      <tr key={p.id} className="border-b border-ink-50 last:border-b-0">
                        <td className="max-w-[260px] p-3 text-body-md break-words">{p.name}</td>
                        <td className="p-3 text-body-md break-words">{p.developerName}</td>
                        <td className="p-3 text-body-md">
                          {CATEGORY_LABEL[p.category] ?? p.category} · {TRANSACTION_LABEL[p.transactionType] ?? p.transactionType}
                        </td>
                        <td className="max-w-[200px] p-3 text-body-md break-words">{p.location ?? "—"}</td>
                        <td className="p-3">
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="p-3">
                          <ProjectStatusDialog projectId={p.id} projectName={p.name} currentStatus={p.status} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah Status</Button>} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {tab === "partners" ? (
          !partners.ok ? (
            <ErrorState title="Developer Partner gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="max-w-2xl text-body-md text-ink-500">
                developer_partners (company_name/logo/deskripsi/PIC) — berbeda dari akun login. user_id opsional: perusahaan bisa terdaftar TANPA akun login (untuk atribusi proyek), dihubungkan
                belakangan setelah PIC-nya diberi role Developer Partner lewat Direktori Pengguna.
              </p>
              {partners.data.length === 0 ? (
                <p className="py-10 text-center text-body-md text-ink-500">Belum ada Developer Partner terdaftar.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-ink-100 bg-white">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-b border-ink-100 text-caption">
                        <th className="p-3 font-bold">Perusahaan</th>
                        <th className="p-3 font-bold">PIC</th>
                        <th className="p-3 font-bold">Kontak PIC</th>
                        <th className="p-3 font-bold">Akun Login</th>
                        <th className="p-3 font-bold">Status</th>
                        <th className="p-3 font-bold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.data.map((p) => {
                        const st = partnerStatus(p.status);
                        return (
                          <tr key={p.id} className="border-b border-ink-50 last:border-b-0">
                            <td className="max-w-[220px] p-3 text-body-md break-words">{p.companyName}</td>
                            <td className="p-3 text-body-md">{p.picName ?? "—"}</td>
                            <td className="p-3 text-body-md">{p.picContact ?? "—"}</td>
                            <td className="p-3 text-body-md">{p.userId ? `Terhubung — ${p.linkedEmail}` : "Belum Terhubung"}</td>
                            <td className="p-3">
                              <Badge tone={st.tone}>{st.label}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                <PartnerFormDialog partner={p} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Edit</Button>} />
                                {!p.userId ? <LinkPartnerAccountDialog partnerId={p.id} companyName={p.companyName} candidates={unlinked} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Hubungkan Akun</Button>} /> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )
        ) : null}
      </div>
    </div>
  );
}
