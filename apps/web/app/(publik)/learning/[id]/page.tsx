// app/(publik)/learning/[id]/page.tsx — Detail Course publik (M11 Detail-Learning): kategori, judul, deskripsi, prasyarat, kurikulum (JUDUL dan jenis materi saja), sesi terkait (hanya terlihat pengguna
// yang login: RLS), dan kartu aksi. Aksi: pengunjung -> "Masuk untuk Mulai Belajar"; Agent -> "Mulai Belajar" (POST /api/courses/{id}/enroll); peran lain -> catatan.
// Course yang belum terbit hanya terlihat pemilik/staf (RLS) dengan spanduk "belum dipublikasikan". Course tidak terbit -> noindex.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/public/EnrollButton";
import { SESSION_STATUS_TONE } from "@/components/public/LearningCards";
import { RichText } from "@/components/public/RichText";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BookIcon, ChevronRightIcon, ClockIcon, DocIcon, LayersIcon, TrophyIcon, VideoIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import {
  COURSE_CATEGORY_LABEL,
  LESSON_TYPE_LABEL,
  SESSION_STATUS_LABEL,
  SESSION_TYPE_LABEL,
  getCourseDetail,
  isEnrolledInCourse,
  sessionTitle,
} from "@/lib/public/learning-data";
import { excerptOf } from "@/lib/public/rich-text";

type Props = { params: Promise<{ id: string }> };

const UNAVAILABLE: Record<string, string> = { draft: "Course Belum Dipublikasikan", archived: "Course Sudah Diarsipkan", pending_review: "Course Sedang Ditinjau", rejected: "Course Ditolak" };
const LESSON_ICON: Record<string, React.ReactNode> = { video: <VideoIcon size={16} />, pdf: <DocIcon size={16} />, slide: <LayersIcon size={16} /> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getCourseDetail(id);
  if (res.state !== "ok") return { title: "Course | RumahAgen", robots: { index: false, follow: false } };
  const c = res.course;
  return {
    title: `${c.title} | Learning RumahAgen`,
    description: excerptOf(c.description, 155) || `Course ${COURSE_CATEGORY_LABEL[c.category] ?? c.category} dari RumahAgen.`,
    alternates: { canonical: `/learning/${c.id}` },
    robots: c.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getCourseDetail(id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Course gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/learning/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const c = res.course;
  const published = c.status === "published";
  const user = await getSessionUser();
  const active = !!user && user.status === "active";
  const isAgent = active && user!.role === "agent";
  const enrolled = isAgent ? await isEnrolledInCourse(c.id, user!.id) : false;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/learning" as Route} className="text-ink-500">
          Learning
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {c.title}
        </span>
      </nav>

      {!published ? (
        <div className="mt-4 flex h-24 items-center justify-center rounded-lg bg-ink-900/60">
          <Badge tone="info" className="px-5 py-2.5 text-[16px]">
            {UNAVAILABLE[c.status] ?? c.status}
          </Badge>
        </div>
      ) : null}

      <div className="grid items-start gap-8 pt-6 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <Badge tone="info" dot={false} className="self-start">
              {COURSE_CATEGORY_LABEL[c.category] ?? c.category}
            </Badge>
            <h1 className="text-headline break-words">{c.title}</h1>
            <RichText text={c.description} empty="Deskripsi course belum ditambahkan." />
          </header>

          {c.awardsTitle ? (
            <div className="flex items-center gap-3 rounded-md border border-gold-200 bg-gold-100 p-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-gold-700">
                <TrophyIcon size={22} />
              </span>
              <div className="min-w-0">
                <span className="text-caption text-gold-700">Title yang Anda dapat setelah lulus</span>
                <div className="text-title-md break-words text-ink-900">{c.awardsTitle.name}</div>
                {c.awardsTitle.description ? <p className="text-caption">{c.awardsTitle.description}</p> : null}
              </div>
            </div>
          ) : null}

          {c.prerequisite ? (
            <Link
              href={`/learning/${c.prerequisite.id}` as Route}
              className="flex items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-4 text-inherit no-underline hover:no-underline"
            >
              <BookIcon size={20} className="flex-none text-warning-600" />
              <span className="min-w-0 flex-1">
                <span className="block text-caption text-warning-600">Prasyarat</span>
                <span className="block truncate text-label-lg text-ink-900">Selesaikan dulu: {c.prerequisite.title}</span>
              </span>
              <ChevronRightIcon size={14} className="flex-none text-ink-500" />
            </Link>
          ) : null}

          <section>
            <h2 className="mb-3 text-title-lg">Kurikulum ({c.lessons.length} materi)</h2>
            {c.lessons.length === 0 ? (
              <p className="rounded-md bg-white p-4 text-body-md text-ink-500 ring-1 ring-ink-100">Materi belum ditambahkan.</p>
            ) : (
              <ol className="overflow-hidden rounded-md border border-ink-100 bg-white">
                {c.lessons.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 border-b border-ink-50 px-4 py-3 last:border-b-0">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-50 text-caption font-bold text-blue-600">{i + 1}</span>
                    <span className="flex-none text-ink-500">{LESSON_ICON[l.content_type]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-lg text-ink-900">{l.title}</span>
                      <span className="text-caption">{LESSON_TYPE_LABEL[l.content_type] ?? l.content_type}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {c.sessions.length > 0 ? (
            <section>
              <h2 className="mb-3 text-title-lg">Learning Session Terkait</h2>
              <ul className="flex flex-col gap-2.5">
                {c.sessions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/learning-session/${s.id}` as Route}
                      className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline"
                    >
                      <ClockIcon size={20} className="flex-none text-blue-600" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-label-lg text-ink-900">{sessionTitle(s)}</span>
                        <span className="text-caption">
                          {SESSION_TYPE_LABEL[s.session_type] ?? s.session_type} · {s.session_type === "on_demand" ? "On-demand" : formatDateTime(s.start_at) || "Jadwal belum ditentukan"}
                        </span>
                      </span>
                      <Badge tone={SESSION_STATUS_TONE[s.status] ?? "neutral"}>{SESSION_STATUS_LABEL[s.status] ?? s.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside aria-label="Mulai belajar" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          <dl className="flex flex-col gap-2">
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Nilai Kelulusan</dt>
              <dd className="text-body-md font-bold">{c.passing_grade}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Total Materi</dt>
              <dd className="text-body-md font-bold">{c.lessons.length} materi</dd>
            </div>
          </dl>
          {!published ? (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Course ini belum tersedia untuk dipelajari.</p>
          ) : !user ? (
            <LinkButton href={`/login?next=${encodeURIComponent(`/learning/${c.id}`)}` as Route} className="h-12 w-full">
              Masuk untuk Mulai Belajar
            </LinkButton>
          ) : !active ? (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Akun Anda sedang dibatasi, sehingga belum bisa mendaftar course.</p>
          ) : isAgent ? (
            <EnrollButton
              endpoint={`/courses/${c.id}/enroll`}
              label="Mulai Belajar"
              alreadyEnrolled={enrolled}
              doneMessage="Anda sudah terdaftar di course ini."
              doneHref={`/agent/belajar/${c.id}`}
              doneLinkLabel="Buka Materi"
            />
          ) : (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Pendaftaran course hanya tersedia untuk akun Agent.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
