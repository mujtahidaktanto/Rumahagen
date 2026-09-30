// components/partner/PartnerDashboardView.tsx — isi Dashboard Developer Partner (M08, wireframe 03-Developer-Partner/M08-Dashboard-Developer). Akun belum terhubung ke `developer_partners`
// (dibuat/dihubungkan staf, SOURCE-Developer-Partner.md §2) -> spanduk "Hubungi Tim RumahAgen", tidak ada widget lain. Pintasan ke layar yang belum dibangun (M06 Proyek/Marketing Kit/Klaim,
// M05 Ajukan Event) tampil "Segera hadir" sampai halamannya ada (pola sama seperti components/agent/DashboardView.tsx).
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { BellIcon, BuildingIcon, CalendarIcon, CheckCircleIcon, FolderIcon } from "@/components/ui/icons";
import { relativeTimeId } from "@/lib/agent/time";
import { PROJECT_STATUS } from "@/lib/admin/developer-admin-rules";
import { claimStatus } from "@/lib/agent/claim-rules";
import { SUPPORT_EMAIL } from "@/lib/config";
import type { PartnerDashboardData } from "@/lib/partner/dashboard-data";
import type { Part } from "@/lib/agent/dashboard-data";

const nf = new Intl.NumberFormat("id-ID");

function whenOk<T>(p: Part<T>): T | null {
  return p.ok ? p.data : null;
}

function Tile({ label, value, hint, href }: { label: string; value: ReactNode; hint?: string; href?: string }) {
  const body = (
    <>
      <span className="text-caption">{label}</span>
      <span className="text-headline">{value}</span>
      {hint ? <span className="text-caption">{hint}</span> : null}
    </>
  );
  return href ? (
    <Link href={href as Route} className="flex flex-col gap-1 rounded-md border border-ink-100 bg-white p-5 text-inherit no-underline hover:border-blue-200 hover:bg-blue-50 hover:no-underline">
      {body}
    </Link>
  ) : (
    <Card className="flex flex-col gap-1 p-5">{body}</Card>
  );
}

const QUICK_ACTIONS: { title: string; note: string; icon: ReactNode; href: string | null }[] = [
  { title: "Buat Proyek Baru", note: "Ajukan proyek coming soon", icon: <BuildingIcon size={20} />, href: "/partner/proyek/baru" },
  { title: "Unggah Marketing Kit", note: "Brosur dan daftar harga", icon: <FolderIcon size={20} />, href: "/partner/marketing-kit" },
  { title: "Tinjau Klaim", note: "Setujui atau tolak klaim agen", icon: <CheckCircleIcon size={20} />, href: null },
  { title: "Ajukan Event", note: "Launching, open house, gathering", icon: <CalendarIcon size={20} />, href: null },
];

function QuickAction({ a }: { a: (typeof QUICK_ACTIONS)[number] }) {
  const body = (
    <>
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-blue-50 text-blue-600">{a.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-label-lg text-ink-900">{a.title}</span>
        <span className="block text-caption">{a.note}</span>
        {a.href ? null : (
          <Badge tone="neutral" dot={false} className="mt-1.5">
            Segera hadir
          </Badge>
        )}
      </span>
    </>
  );
  return a.href ? (
    <Link href={a.href as Route} className="flex min-h-[76px] items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
      {body}
    </Link>
  ) : (
    <div aria-disabled="true" className="flex min-h-[76px] items-center gap-3 rounded-md border border-ink-100 bg-white p-4 opacity-70">
      {body}
    </div>
  );
}

function Widget({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <h2 className="text-title-md">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function PartnerDashboardView({ data }: { data: PartnerDashboardData }) {
  if (!data.linked) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Dashboard</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Hubungi tim RumahAgen untuk menghubungkan akun Anda ke data perusahaan sebelum bisa mengelola proyek.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
      </div>
    );
  }

  const stats = whenOk(data.stats);
  const claims = whenOk(data.pendingClaims);
  const projects = whenOk(data.recentProjects);
  const notes = whenOk(data.notifications);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div>
        <h1 className="text-headline">Dashboard</h1>
        <p className="text-body-md text-ink-500">Halo, {data.companyName}.</p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-info-100 p-4">
        <span className="text-body-md">
          Proyek Coming Soon sudah tampil publik sebagai &ldquo;Segera hadir&rdquo;. Status Aktif hanya diberikan tim RumahAgen. Lengkapi media dan marketing kit, atau{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold">
            hubungi tim
          </a>
          .
        </span>
      </div>

      {!stats ? (
        <ErrorState title="Ringkasan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Tile label="Proyek Saya" value={nf.format(stats.projectsTotal)} hint={`${nf.format(stats.projectsActive)} aktif · ${nf.format(stats.projectsComingSoon)} coming soon`} href="/partner/proyek" />
          <Tile label="Klaim Menunggu Review" value={nf.format(stats.claimsPending)} hint="Perlu keputusan Anda" />
          <Tile label="Klaim Disetujui" value={nf.format(stats.claimsApproved)} hint="Agen aktif memasarkan proyek Anda" />
          <Tile label="Event Menunggu Persetujuan" value={nf.format(stats.eventsPending)} hint="Ditinjau tim RumahAgen" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <QuickAction key={a.title} a={a} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Widget title="Klaim yang Perlu Ditinjau">
          {!claims ? (
            <div className="p-5">
              <ErrorState title="Klaim gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            </div>
          ) : claims.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Tidak ada klaim menunggu" message="Klaim baru dari Agent akan muncul di sini." />
            </div>
          ) : (
            <div className="flex flex-col">
              {claims.map((c) => (
                <div key={c.id} className="flex items-center gap-3 border-t border-ink-50 px-5 py-3 first:border-t-0">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg">{c.agentName}</div>
                    <div className="truncate text-caption">
                      Mengklaim {c.projectName} · {relativeTimeId(c.claimedAt)}
                    </div>
                  </div>
                  <Badge tone={claimStatus("pending").tone}>{claimStatus("pending").label}</Badge>
                </div>
              ))}
            </div>
          )}
        </Widget>

        <Widget title="Notifikasi" action={notes ? <span className="text-caption">{notes.unread} baru</span> : undefined}>
          {!notes ? (
            <div className="p-5">
              <ErrorState title="Notifikasi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            </div>
          ) : notes.items.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Belum ada notifikasi" />
            </div>
          ) : (
            <div className="flex flex-col">
              {notes.items.map((n) => (
                <div key={n.id} className="flex items-start gap-3 border-t border-ink-50 px-5 py-3 first:border-t-0">
                  <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${n.isRead ? "bg-ink-100" : "bg-blue-600"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-body-md">{n.title}</div>
                    <div className="text-caption">{relativeTimeId(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-ink-100 px-5 py-3">
            <Link href={"/partner/notifikasi" as Route} className="inline-flex items-center gap-1.5 text-label-lg text-blue-600">
              <BellIcon size={16} /> Lihat semua notifikasi
            </Link>
          </div>
        </Widget>
      </div>

      <Widget
        title="Proyek Saya"
        action={
          <Link href={"/partner/proyek" as Route} className="text-label-lg text-blue-600">
            Kelola proyek
          </Link>
        }
      >
        {!projects ? (
          <div className="p-5">
            <ErrorState title="Proyek gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Belum ada proyek" message="Proyek yang Anda buat akan muncul di sini." />
          </div>
        ) : (
          <div className="flex flex-col">
            {projects.map((p) => {
              const st = PROJECT_STATUS[p.status] ?? { label: p.status, tone: "neutral" as const };
              return (
                <Link key={p.id} href={`/partner/proyek/${p.id}` as Route} className="flex items-center gap-3 border-t border-ink-50 px-5 py-3 text-inherit no-underline first:border-t-0 hover:bg-ink-50 hover:no-underline">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-ink-50 text-ink-500">
                    <BuildingIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg">{p.name}</div>
                    <div className="truncate text-caption">{p.location ?? "—"}</div>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </Widget>
    </div>
  );
}
