// app/(publik)/learning-session/[id]/page.tsx — Detail Learning Session (M11 Detail-Learning-Session): tipe, visibilitas, status, jadwal, kursus terkait, penyelenggara, deskripsi (dari kursus), dan kartu aksi.
// Hanya untuk pengguna yang login (RLS); pengunjung melihat "Sesi Ini Bersifat Terbatas". Aksi Agent: "Daftar Sesi Ini" (POST /api/learning/sessions/{id}/enrollments) untuk sesi terjadwal;
// sesi berlangsung/selesai/dibatalkan/gagal menampilkan keadaan nonaktif (tautan gabung dan rekaman butuh API terpisah: lihat audit/FRONTEND_GAPS.md). Selalu noindex.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/public/EnrollButton";
import { SESSION_STATUS_TONE } from "@/components/public/LearningCards";
import { RestrictedPanel } from "@/components/public/RestrictedPanel";
import { RichText } from "@/components/public/RichText";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BookIcon, BuildingIcon, CalendarIcon, ChevronRightIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import {
  SESSION_STATUS_LABEL,
  SESSION_TYPE_LABEL,
  SESSION_VISIBILITY_LABEL,
  getSessionDetail,
  isEnrolledInSession,
  isUuid,
  sessionTitle,
} from "@/lib/public/learning-data";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Learning Session | RumahAgen", robots: { index: false, follow: false } };

const UNAVAILABLE: Record<string, string> = {
  draft: "Sesi Belum Dipublikasikan",
  cancelled: "Sesi Dibatalkan",
  failed: "Sesi Gagal Dilaksanakan",
};

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const user = await getSessionUser();
  if (!user || user.status !== "active") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
        <RestrictedPanel title="Sesi Ini Bersifat Terbatas" message="Detail Learning Session hanya dapat dilihat oleh pengguna yang sudah masuk. Masuk untuk memeriksa akses Anda." nextPath={`/learning-session/${id}`} />
      </div>
    );
  }

  const res = await getSessionDetail(id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Sesi gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/learning-session/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const s = res.session;
  const isAgent = user.role === "agent";
  const enrolled = isAgent ? await isEnrolledInSession(s.id, user.id) : false;
  const schedule = s.session_type === "on_demand" ? "On-demand" : [formatDateTime(s.start_at), s.end_at ? `s.d. ${formatDateTime(s.end_at)}` : ""].filter(Boolean).join(" ") || "Jadwal belum ditentukan";

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/learning-session" as Route} className="text-ink-500">
          Learning Session
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {sessionTitle(s)}
        </span>
      </nav>

      {UNAVAILABLE[s.status] ? (
        <div className="mt-4 flex h-24 items-center justify-center rounded-lg bg-ink-900/60">
          <Badge tone={SESSION_STATUS_TONE[s.status] ?? "neutral"} className="px-5 py-2.5 text-[16px]">
            {UNAVAILABLE[s.status]}
          </Badge>
        </div>
      ) : null}

      <div className="grid items-start gap-8 pt-6 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {s.status === "live" ? (
                <Badge tone="danger" className="uppercase">
                  Live Sekarang
                </Badge>
              ) : null}
              <Badge tone="info" dot={false}>
                {SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}
              </Badge>
              <Badge tone={s.visibility === "public" ? "success" : "neutral"}>{SESSION_VISIBILITY_LABEL[s.visibility] ?? s.visibility}</Badge>
              <Badge tone={SESSION_STATUS_TONE[s.status] ?? "neutral"}>{SESSION_STATUS_LABEL[s.status] ?? s.status}</Badge>
            </div>
            <h1 className="text-headline break-words">{sessionTitle(s)}</h1>
            <p className="flex items-center gap-1.5 text-body-md text-ink-500">
              <CalendarIcon size={15} className="flex-none" />
              <span>{schedule}</span>
            </p>
          </header>

          {s.course ? (
            <Link href={`/learning/${s.course.id}` as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
              <BookIcon size={20} className="flex-none text-blue-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label-lg text-ink-900">Bagian dari: {s.course.title}</span>
                <span className="text-caption">Lihat kurikulum lengkap course</span>
              </span>
              <ChevronRightIcon size={14} className="flex-none text-ink-500" />
            </Link>
          ) : null}
          {s.organizationName ? (
            s.organizationSlug ? (
              <Link href={`/organisasi/${s.organizationSlug}` as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
                <BuildingIcon size={20} className="flex-none text-blue-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-lg text-ink-900">Diselenggarakan oleh {s.organizationName}</span>
                  <span className="text-caption">Lihat profil organisasi</span>
                </span>
                <ChevronRightIcon size={14} className="flex-none text-ink-500" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4">
                <BuildingIcon size={20} className="flex-none text-blue-600" />
                <span className="min-w-0">
                  <span className="block truncate text-label-lg text-ink-900">Diselenggarakan oleh {s.organizationName}</span>
                </span>
              </div>
            )
          ) : null}
          {s.event ? (
            <Link href={`/event/${s.event.id}` as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
              <CalendarIcon size={20} className="flex-none text-blue-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label-lg text-ink-900">Bagian dari event: {s.event.title}</span>
                <span className="text-caption">Lihat detail event</span>
              </span>
              <ChevronRightIcon size={14} className="flex-none text-ink-500" />
            </Link>
          ) : null}

          <section>
            <h2 className="mb-3 text-title-lg">Tentang Sesi Ini</h2>
            <RichText text={s.course?.description} empty="Deskripsi sesi belum ditambahkan." />
          </section>
        </div>

        <aside aria-label="Pendaftaran sesi" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          {s.status === "scheduled" ? (
            isAgent ? (
              <>
                <EnrollButton
                  endpoint={`/learning/sessions/${s.id}/enrollments`}
                  label="Daftar Sesi Ini"
                  alreadyEnrolled={enrolled}
                  doneMessage="Pendaftaran Anda tercatat. Anda akan mendapat kabar bila permintaan disetujui."
                />
                <span className="text-center text-caption">Mulai {schedule}</span>
              </>
            ) : (
              <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Pendaftaran sesi hanya tersedia untuk akun Agent.</p>
            )
          ) : s.status === "live" ? (
            <p className="rounded-md bg-danger-100 p-3 text-body-md text-danger-600">Sesi sedang berlangsung. Peserta terdaftar bergabung dari akun masing-masing.</p>
          ) : s.status === "ended" ? (
            <Button variant="secondary" disabled className="h-12 w-full">
              Sesi Telah Berakhir
            </Button>
          ) : s.status === "cancelled" ? (
            <Button variant="secondary" disabled className="h-12 w-full">
              Sesi Dibatalkan
            </Button>
          ) : s.status === "failed" ? (
            <Button variant="secondary" disabled className="h-12 w-full">
              Sesi Gagal Dilaksanakan
            </Button>
          ) : (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Sesi ini belum dibuka untuk pendaftaran.</p>
          )}
          <dl className="flex flex-col gap-2 border-t border-ink-100 pt-4">
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Tipe Sesi</dt>
              <dd className="text-body-md font-bold">{SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Visibilitas</dt>
              <dd className="text-body-md font-bold">{SESSION_VISIBILITY_LABEL[s.visibility] ?? s.visibility}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
