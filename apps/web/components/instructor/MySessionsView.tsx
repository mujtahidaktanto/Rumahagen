// components/instructor/MySessionsView.tsx — Sesi Saya (M04, wireframe 04-Instructor/M04-Sesi-Saya): sesi milik sendiri ATAU sesi dengan penugasan HOST/INSTRUCTOR aktif
// (RLS learning_sessions_select, migration 0129 is_session_team) — daftar tidak membedakan keduanya secara visual, sama-sama "Sesi Saya" bagi Instructor.
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { VideoIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/format";
import type { MySessionRow } from "@/lib/instructor/session-data";
import { SESSION_TYPE_LABEL, sessionStatus } from "@/lib/instructor/session-rules";
import type { Part } from "@/lib/agent/dashboard-data";

export function MySessionsView({ sessions }: { sessions: Part<MySessionRow[]> }) {
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Sesi Saya</h1>
        <LinkButton href={"/instructor/sesi/baru" as Route}>+ Buat Sesi</LinkButton>
      </div>

      {!sessions.ok ? (
        <ErrorState title="Sesi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : sessions.data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Belum ada sesi mendatang. Buat sesi pertama Anda.</p>
          <div className="mt-4 flex justify-center">
            <LinkButton href={"/instructor/sesi/baru" as Route}>+ Buat Sesi</LinkButton>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
          {sessions.data.map((s) => {
            const st = sessionStatus(s.status);
            return (
              <li key={s.id}>
                <Link href={`/instructor/sesi/${s.id}` as Route} className="flex items-center gap-3 p-3.5 text-inherit no-underline hover:bg-ink-50 hover:no-underline">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-ink-50 text-ink-500">
                    <VideoIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg text-ink-900">{s.title}</div>
                    <div className="truncate text-caption">
                      {SESSION_TYPE_LABEL[s.sessionType] ?? s.sessionType} · {formatDateTime(s.startAt)}
                    </div>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
