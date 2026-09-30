// components/instructor/InstructorDashboardView.tsx — isi Dashboard Instruktur (M08, wireframe 04-Instructor/M08-Dashboard-Instruktur). Semua pintasan Sesi/Kursus/Event kini aktif;
// hanya Profil Instruktur yang masih tersisa dari Fase 6 (belum ada tile/pintasan ke sana di dashboard ini, sesuai wireframe M08 yang memang tidak menyertakannya).
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { BellIcon, CalendarIcon, PinIcon, VideoIcon } from "@/components/ui/icons";
import { relativeTimeId } from "@/lib/agent/time";
import { formatDateTime } from "@/lib/format";
import { sessionStatus, SESSION_TYPE_LABEL } from "@/lib/instructor/session-rules";
import type { InstructorDashboardData } from "@/lib/instructor/dashboard-data";
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
  { title: "Buat Sesi Baru", note: "Broadcast, interaktif, atau on-demand", icon: <VideoIcon size={20} />, href: "/instructor/sesi/baru" },
  { title: "Buat Event", note: "Terbitkan langsung tanpa tinjauan tim", icon: <CalendarIcon size={20} />, href: "/instructor/event/baru" },
  { title: "Pusat Notifikasi", note: "Lihat semua notifikasi", icon: <BellIcon size={20} />, href: "/instructor/notifikasi" },
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

export function InstructorDashboardView({ name, data }: { name: string; data: InstructorDashboardData }) {
  const stats = whenOk(data.stats);
  const upcoming = whenOk(data.upcoming);
  const pendingAttendance = whenOk(data.pendingAttendance);
  const notes = whenOk(data.notifications);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div>
        <h1 className="text-headline">Dashboard</h1>
        <p className="text-body-md text-ink-500">Halo, {name}.</p>
      </div>

      {!stats ? (
        <ErrorState title="Ringkasan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Tile label="Sesi Mendatang" value={nf.format(stats.upcomingCount)} hint="Terjadwal atau sedang live" href="/instructor/sesi" />
          <Tile label="Sedang Live" value={nf.format(stats.liveCount)} hint="Sesi berlangsung sekarang" href="/instructor/sesi" />
          <Tile label="Kehadiran Belum Dinilai" value={nf.format(stats.pendingAttendanceCount)} hint="Peserta pada sesi selesai" />
          <Tile label="Event Saya" value={nf.format(stats.eventsUnpublishedCount)} hint="Belum diterbitkan" href="/instructor/event" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((a) => (
          <QuickAction key={a.title} a={a} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Widget
          title="Sesi Mendatang"
          action={
            <Link href={"/instructor/sesi" as Route} className="text-label-lg text-blue-600">
              Semua sesi
            </Link>
          }
        >
          {!upcoming ? (
            <div className="p-5">
              <ErrorState title="Sesi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Belum ada sesi mendatang" message="Buat sesi pertama Anda." />
            </div>
          ) : (
            <div className="flex flex-col">
              {upcoming.map((s) => (
                <Link
                  key={s.id}
                  href={`/instructor/sesi/${s.id}` as Route}
                  className="flex items-center gap-3 border-t border-ink-50 px-5 py-3 text-inherit no-underline first:border-t-0 hover:bg-blue-50 hover:no-underline"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-ink-50 text-ink-500">
                    <VideoIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg">{s.title}</div>
                    <div className="truncate text-caption">
                      {SESSION_TYPE_LABEL[s.sessionType] ?? s.sessionType} · {formatDateTime(s.startAt)}
                    </div>
                  </div>
                  <Badge tone={sessionStatus(s.status).tone}>{sessionStatus(s.status).label}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Widget>

        <Widget title="Perlu Dinilai">
          {!pendingAttendance ? (
            <div className="p-5">
              <ErrorState title="Data gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            </div>
          ) : pendingAttendance.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Tidak ada yang perlu dinilai" message="Kehadiran peserta pada sesi selesai sudah dinilai semua." />
            </div>
          ) : (
            <div className="flex flex-col">
              {pendingAttendance.map((s) => (
                <Link
                  key={s.sessionId}
                  href={`/instructor/sesi/${s.sessionId}` as Route}
                  className="flex items-center gap-3 border-t border-ink-50 px-5 py-3 text-inherit no-underline first:border-t-0 hover:bg-blue-50 hover:no-underline"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-warning-100 text-warning-600">
                    <PinIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg">{s.title}</div>
                    <div className="truncate text-caption">{s.ungradedCount} peserta belum dinilai{s.endAt ? ` · Selesai ${relativeTimeId(s.endAt)}` : ""}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Widget>
      </div>

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
          <Link href={"/instructor/notifikasi" as Route} className="inline-flex items-center gap-1.5 text-label-lg text-blue-600">
            <BellIcon size={16} /> Lihat semua notifikasi
          </Link>
        </div>
      </Widget>
    </div>
  );
}
