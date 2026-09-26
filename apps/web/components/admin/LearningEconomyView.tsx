// components/admin/LearningEconomyView.tsx — Ekonomi Pembelajaran (M04, wireframe 02-Admin/M04-Learning-Economy-Config): 3 tab, ketiganya Superadmin/Admin/Manager setara (tidak ada
// pembatasan lintas peran seperti modul lain — m04.learning_economy_configuration.*/m04.learning_activity.manage granted_scope 'all' utk ketiga role, RPC adjust_learning_points/
// admin_issue_certificate juga membuka ketiganya).
import Link from "next/link";
import type { Route } from "next";
import { ActivityFormDialog } from "@/components/admin/ActivityFormDialog";
import { CertificateIssuanceTool } from "@/components/admin/CertificateIssuanceTool";
import { ConfigKeyFormDialog } from "@/components/admin/ConfigKeyFormDialog";
import { PointAdjustmentTool } from "@/components/admin/PointAdjustmentTool";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { AgentPickerRow, CoursePickerRow, LearningActivityRow, LearningEconomyConfigRow } from "@/lib/admin/learning-economy-data";
import type { Part } from "@/lib/agent/dashboard-data";

type Tab = "config" | "catalog" | "tools";

function tabHref(tab: Tab): Route {
  return `/admin/ekonomi-belajar?tab=${tab}` as Route;
}

export function LearningEconomyView({
  tab,
  configs,
  activities,
  agents,
  courses,
}: {
  tab: Tab;
  configs: Part<LearningEconomyConfigRow[]>;
  activities: Part<LearningActivityRow[]>;
  agents: Part<AgentPickerRow[]> | null;
  courses: Part<CoursePickerRow[]> | null;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Ekonomi Pembelajaran</h1>
          <p className="text-caption">Konfigurasi, aktivitas, dan perkakas manual poin/sertifikat</p>
        </div>
        {tab === "config" ? (
          <ConfigKeyFormDialog trigger={(open) => <Button onClick={open}>+ Tambah Config Key</Button>} />
        ) : tab === "catalog" ? (
          <ActivityFormDialog trigger={(open) => <Button onClick={open}>+ Aktivitas Baru</Button>} />
        ) : null}
      </div>

      <div className="flex gap-6 border-b border-ink-100 px-4 lg:px-8">
        <Link href={tabHref("config")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "config" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Konfigurasi Ekonomi
        </Link>
        <Link href={tabHref("catalog")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "catalog" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Katalog Aktivitas
        </Link>
        <Link href={tabHref("tools")} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === "tools" ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
          Poin & Sertifikat
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "config" ? (
          !configs.ok ? (
            <ErrorState title="Konfigurasi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : configs.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada config key. Tambahkan key pertama untuk mengatur parameter ekonomi pembelajaran.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Key</TH>
                  <TH>Value</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {configs.data.map((c) => (
                  <TR key={c.configKey}>
                    <TD className="font-mono text-[12.5px]">{c.configKey}</TD>
                    <TD className="text-body-md">{c.configValue ?? <span className="text-ink-300">—</span>}</TD>
                    <TD>
                      <ConfigKeyFormDialog config={c} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )
        ) : tab === "catalog" ? (
          !activities.ok ? (
            <ErrorState title="Katalog aktivitas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : activities.data.length === 0 ? (
            <p className="py-16 text-center text-body-md text-ink-500">Belum ada aktivitas pembelajaran.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Urutan</TH>
                  <TH>Kode</TH>
                  <TH>Judul</TH>
                  <TH>Tipe</TH>
                  <TH>Reward LP</TH>
                  <TH>Wajib</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {activities.data.map((a) => (
                  <TR key={a.id}>
                    <TD className="text-body-md text-ink-500">{a.sequenceNo ?? "—"}</TD>
                    <TD className="font-mono text-[12.5px]">{a.code}</TD>
                    <TD className="text-label-lg">{a.title}</TD>
                    <TD className="text-body-md">{a.activityType}</TD>
                    <TD className="text-body-md">{a.rewardLp}</TD>
                    <TD>
                      <Badge tone={a.completionRequired ? "info" : "neutral"}>{a.completionRequired ? "Wajib" : "Opsional"}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={a.status === "active" ? "success" : "neutral"}>{a.status}</Badge>
                    </TD>
                    <TD>
                      <ActivityFormDialog activity={a} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Edit</Button>} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )
        ) : !agents?.ok || !courses?.ok ? (
          <ErrorState title="Data perkakas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <div className="flex flex-wrap gap-4">
            <PointAdjustmentTool agents={agents.data} />
            <CertificateIssuanceTool agents={agents.data} courses={courses.data} />
          </div>
        )}
      </div>
    </div>
  );
}
