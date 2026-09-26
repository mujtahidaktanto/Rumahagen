// components/agent/LearningView.tsx — isi "Pembelajaran" Agent (M04, wireframe 01-Agent/M04-Pembelajaran): kartu Learning Points + riwayat, Course Saya (progres), Sertifikat Saya, Sesi Belajar Saya.
// Tiap kartu punya empat keadaan sendiri (memuat = loading.tsx, kosong, gagal, sukses) sehingga gagal di satu bagian tidak menjatuhkan halaman. Kartu "Learning Path" di wireframe
// belum ada sumber datanya (lihat audit/FRONTEND_GAPS.md) dan tidak ditampilkan.
import Link from "next/link";
import type { Route } from "next";
import { CertificateList } from "@/components/agent/CertificateList";
import { LpHistoryButton } from "@/components/agent/LpHistoryButton";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { BookIcon, VideoIcon } from "@/components/ui/icons";
import type { MyLearning } from "@/lib/agent/learning-data";
import { ENROLLMENT_TONE, SESSION_ENROLLMENT_TONE } from "@/lib/agent/learning-rules";
import { formatDate, formatDateTime } from "@/lib/format";
import { COURSE_CATEGORY_LABEL } from "@/lib/public/learning-data";

const nf = new Intl.NumberFormat("id-ID");

function Section({ title, count, children }: { title: string; count?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {count ? <span className="text-caption">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function LearningView({ data }: { data: MyLearning }) {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Pembelajaran</h1>
        <LinkButton href={"/learning" as Route} variant="secondary" size="sm">
          Jelajahi Course Lain
        </LinkButton>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gradient-to-br from-gold-600 to-gold-700 p-5 text-white sm:px-7 sm:py-6">
        <div>
          <span className="text-caption text-white/85">Learning Points Anda</span>
          <div className="text-display" aria-live="polite">
            {data.points.ok ? `${nf.format(data.points.data)} LP` : "—"}
          </div>
          {!data.points.ok ? <span className="text-caption text-white/85">Saldo gagal dimuat. Muat ulang halaman ini.</span> : null}
        </div>
        <LpHistoryButton />
      </div>

      <Section title="Course Saya" count={data.courses.ok ? `${data.courses.data.length} course` : undefined}>
        {!data.courses.ok ? (
          <ErrorState title="Course gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : data.courses.data.length === 0 ? (
          <EmptyState
            title="Anda belum mendaftar course apapun"
            message="Pilih course dari katalog, lalu tekan Mulai Belajar."
            action={
              <LinkButton href={"/learning" as Route} size="sm">
                Jelajahi Course
              </LinkButton>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.data.map((c) => (
              <li key={c.enrollmentId}>
                <Link href={`/agent/belajar/${c.courseId}` as Route} className="flex h-full flex-col overflow-hidden rounded-md border border-ink-100 text-inherit no-underline hover:shadow-2 hover:no-underline">
                  <span aria-hidden="true" className="flex h-24 items-center justify-center bg-ink-100 text-ink-300">
                    <BookIcon size={28} />
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-3.5">
                    {c.category ? (
                      <Badge tone="info" dot={false} className="self-start">
                        {COURSE_CATEGORY_LABEL[c.category] ?? c.category}
                      </Badge>
                    ) : null}
                    <span className="min-h-[38px] text-label-lg break-words [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{c.title}</span>
                    <span role="progressbar" aria-label={`Progres ${c.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progress} className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <span className="block h-full rounded-full bg-blue-600" style={{ width: `${c.progress}%` }} />
                    </span>
                    <span className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-caption">{c.progress}% selesai</span>
                      <Badge tone={ENROLLMENT_TONE[c.status] ?? "neutral"}>{c.status}</Badge>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Sertifikat Saya" count={data.certificates.ok ? `${data.certificates.data.filter((c) => c.status !== "revoked").length} kursus selesai` : undefined}>
        <CertificateList items={data.certificates.ok ? data.certificates.data : null} />
      </Section>

      <Section title="Sesi Belajar Saya" count={data.sessions.ok ? `${data.sessions.data.length} sesi` : undefined}>
        {!data.sessions.ok ? (
          <ErrorState title="Sesi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : data.sessions.data.length === 0 ? (
          <EmptyState title="Belum ada sesi belajar yang diikuti" message="Sesi live dan on-demand yang Anda daftar akan muncul di sini." />
        ) : (
          <ul>
            {data.sessions.data.map((s) => (
              <li key={s.id} className="border-b border-ink-50 last:border-b-0">
                <Link href={`/learning-session/${s.sessionId}` as Route} className="flex items-center gap-3 py-3 text-inherit no-underline hover:no-underline">
                  <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                    <VideoIcon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label-lg">{s.title}</span>
                    <span className="text-caption">{s.status === "completed" ? `Selesai ${formatDate(s.completedAt ?? s.endAt)}` : s.startAt ? formatDateTime(s.startAt) : "Jadwal belum ditentukan"}</span>
                  </span>
                  <Badge tone={SESSION_ENROLLMENT_TONE[s.status] ?? "neutral"} className="flex-none">
                    {s.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
