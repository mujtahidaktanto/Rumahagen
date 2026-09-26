// app/(publik)/event/[id]/page.tsx — Detail Event publik (M11 Detail-Event; {id} = uuid, event tidak punya slug): kategori, judul, penyelenggara, kartu tanggal/jam dan format/lokasi, Tentang Event, event terkait
// (course dan proyek), dan kartu pendaftaran. Pendaftaran: pengunjung -> "Masuk untuk Mendaftar"; Agent -> "Daftar Sekarang" (auto_confirm) atau "Ajukan Pendaftaran" (manual_approval) lewat
// POST /api/events/{id}/rsvp; closed -> "Pendaftaran Ditutup"; event selesai -> tombol nonaktif. Kuota penuh/daftar tunggu tidak bisa ditentukan publik (lihat lib/public/event-data.ts).
// `meeting_link` tidak ditampilkan. Event tidak terbit/tidak publik -> "Event tidak ditemukan".
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DateBox } from "@/components/public/EventCard";
import { EnrollButton } from "@/components/public/EnrollButton";
import { RichText } from "@/components/public/RichText";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BookIcon, BuildingIcon, ChevronRightIcon, PinIcon, UserIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth/session";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { EVENT_CATEGORY_LABEL, REGISTRATION_STATUS_LABEL, getEventDetail, getMyRegistrationStatus, isEventPast } from "@/lib/public/event-data";
import { excerptOf } from "@/lib/public/rich-text";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getEventDetail(id);
  if (res.state !== "ok") return { title: "Event | RumahAgen", robots: { index: false, follow: false } };
  const e = res.event;
  const description = excerptOf(e.description, 155) || `${EVENT_CATEGORY_LABEL[e.category] ?? "Event"} ${formatDateLong(e.start_at)}${e.host ? ` oleh ${e.host}` : ""}.`;
  return { title: `${e.title} | Event RumahAgen`, description, alternates: { canonical: `/event/${e.id}` }, openGraph: { title: e.title, description, type: "website" } };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getEventDetail(id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Event gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/event/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const e = res.event;
  const past = isEventPast(e);
  const user = await getSessionUser();
  const active = !!user && user.status === "active";
  const isAgent = active && user!.role === "agent";
  const myStatus = isAgent ? await getMyRegistrationStatus(e.id, user!.id) : null;
  const registered = myStatus !== null && myStatus !== "cancelled";
  const mode = e.registration_approval_mode;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/event" as Route} className="text-ink-500">
          Event
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {e.title}
        </span>
      </nav>

      {past ? (
        <div className="mt-4 flex h-20 items-center justify-center rounded-lg bg-ink-900/60">
          <Badge tone="neutral" className="px-5 py-2.5 text-[16px]">
            Event Telah Berakhir
          </Badge>
        </div>
      ) : null}

      <header className="flex flex-col gap-2 pt-6">
        <Badge tone="info" dot={false} className="self-start">
          {EVENT_CATEGORY_LABEL[e.category] ?? e.category}
        </Badge>
        <h1 className="text-headline break-words">{e.title}</h1>
        {e.host ? (
          <p className="flex items-center gap-1.5 text-body-md text-ink-500">
            <UserIcon size={15} className="flex-none" />
            <span>Diselenggarakan oleh {e.host}</span>
          </p>
        ) : null}
      </header>

      <div className="mt-5 flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3.5">
          <DateBox iso={e.start_at} className="h-14 w-14" />
          <div>
            <div className="text-label-lg">{formatDateLong(e.start_at)}</div>
            <div className="text-body-md text-ink-500">{formatTimeRange(e.start_at, e.end_at)}</div>
          </div>
        </div>
        <div className="hidden h-12 w-px bg-ink-100 sm:block" aria-hidden="true" />
        <div className="flex items-center gap-3.5">
          <span aria-hidden="true" className="flex h-14 w-14 flex-none items-center justify-center rounded-md bg-success-100 text-success-600">
            <PinIcon size={22} />
          </span>
          <div className="min-w-0">
            <div className="text-label-lg">{e.is_online ? "Online" : "Offline"}</div>
            <div className="text-body-md break-words text-ink-500">{e.is_online ? "Tautan bergabung dibagikan penyelenggara setelah pendaftaran." : (e.location ?? "Lokasi belum ditentukan")}</div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-8 pt-8 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <section>
            <h2 className="mb-3 text-title-lg">Tentang Event</h2>
            <RichText text={e.description} empty="Penyelenggara belum menambahkan deskripsi." />
          </section>

          {e.course || e.project ? (
            <section>
              <h2 className="mb-3 text-title-lg">Terkait Event Ini</h2>
              <div className="flex flex-col gap-2.5">
                {e.course ? (
                  <Link href={`/learning/${e.course.id}` as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-gold-100 text-gold-700">
                      <BookIcon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-lg text-ink-900">{e.course.title}</span>
                      <span className="text-caption">Materi Learning terkait</span>
                    </span>
                    <ChevronRightIcon size={14} className="flex-none text-ink-500" />
                  </Link>
                ) : null}
                {e.project ? (
                  <Link href={`/project/${e.project.slug}` as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                      <BuildingIcon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-lg text-ink-900">{e.project.name}</span>
                      <span className="text-caption">Proyek developer terkait</span>
                    </span>
                    <ChevronRightIcon size={14} className="flex-none text-ink-500" />
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside aria-label="Pendaftaran" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          {e.quota ? (
            <div className="flex justify-between gap-3">
              <span className="text-body-md">Kuota Peserta</span>
              <span className="text-body-md font-bold">{e.quota} peserta</span>
            </div>
          ) : null}

          {past ? (
            <Button variant="secondary" disabled className="h-12 w-full">
              Event Telah Berakhir
            </Button>
          ) : mode === "closed" ? (
            <Button variant="secondary" disabled className="h-12 w-full">
              Pendaftaran Ditutup
            </Button>
          ) : !user ? (
            <LinkButton href={`/login?next=${encodeURIComponent(`/event/${e.id}`)}` as Route} className="h-12 w-full">
              Masuk untuk Mendaftar
            </LinkButton>
          ) : !active ? (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Akun Anda sedang dibatasi, sehingga belum bisa mendaftar event.</p>
          ) : !isAgent ? (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Pendaftaran event hanya tersedia untuk akun Agent.</p>
          ) : registered ? (
            <p role="status" className="rounded-md bg-success-100 p-3 text-body-md text-success-600">
              Status pendaftaran Anda: {REGISTRATION_STATUS_LABEL[myStatus!] ?? myStatus}.
            </p>
          ) : (
            <>
              <EnrollButton
                endpoint={`/events/${e.id}/rsvp`}
                body={{ participant_mode: "self" }}
                label={mode === "manual_approval" ? "Ajukan Pendaftaran" : "Daftar Sekarang"}
                doneMessage={mode === "manual_approval" ? "Pengajuan Anda tercatat dan akan ditinjau penyelenggara." : "Anda terdaftar di event ini."}
              />
              {mode === "manual_approval" ? <span className="text-caption">Pendaftaran akan ditinjau penyelenggara.</span> : null}
            </>
          )}

          <dl className="flex flex-col gap-2 border-t border-ink-100 pt-3.5">
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Kategori</dt>
              <dd className="text-body-md font-bold">{EVENT_CATEGORY_LABEL[e.category] ?? e.category}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Format</dt>
              <dd className="text-body-md font-bold">{e.is_online ? "Online" : "Offline"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
