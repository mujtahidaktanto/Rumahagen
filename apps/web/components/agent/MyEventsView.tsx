// components/agent/MyEventsView.tsx — isi "Event Saya" Agent (M05, wireframe 01-Agent/M05-Event-Saya): "Event yang Saya Daftar" (status pendaftaran) dan "Event yang Saya Ajukan" (status tayang + mode registrasi,
// tautan Kelola). Tiap kartu punya empat keadaan (memuat = loading.tsx, kosong, gagal, sukses). Tombol "Batalkan" pendaftaran di wireframe belum ada: tidak ada API pembatalan pendaftaran dan RLS
// mengizinkan peserta mengubah status pendaftarannya bebas (lihat audit/FRONTEND_GAPS.md), jadi belum ditampilkan.
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { CalendarIcon } from "@/components/ui/icons";
import type { MyEvents } from "@/lib/agent/event-data";
import { APPROVAL_LABEL, EVENT_CATEGORY_LABEL, EVENT_STATUS_LABEL, EVENT_STATUS_TONE, REGISTRATION_LABEL, REGISTRATION_TONE } from "@/lib/agent/event-rules";
import { formatDateTime } from "@/lib/format";

function Section({ title, count, children }: { title: string; count?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {count ? <span className="text-caption">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function MyEventsView({ data }: { data: MyEvents }) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Event Saya</h1>
        <LinkButton href={"/agent/event/baru" as Route} size="sm">
          + Ajukan Event
        </LinkButton>
      </div>

      <Section title="Event yang Saya Daftar" count={data.registrations.ok ? `${data.registrations.data.length} pendaftaran` : undefined}>
        {!data.registrations.ok ? (
          <ErrorState title="Pendaftaran gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : data.registrations.data.length === 0 ? (
          <EmptyState
            title="Anda belum mendaftar event apapun"
            message="Temukan open house, training, dan gathering di halaman Event."
            action={
              <LinkButton href={"/event" as Route} size="sm">
                Jelajahi Event
              </LinkButton>
            }
          />
        ) : (
          <ul>
            {data.registrations.data.map((r) => (
              <li key={r.id} className="border-b border-ink-50 last:border-b-0">
                <Link href={`/event/${r.eventId}` as Route} className="flex items-center gap-3.5 py-3.5 text-inherit no-underline hover:no-underline">
                  <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                    <CalendarIcon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-md">{r.title}</span>
                    <span className="text-caption">
                      {r.startAt ? formatDateTime(r.startAt) : "Jadwal belum tersedia"}
                      {r.category ? ` · ${EVENT_CATEGORY_LABEL[r.category] ?? r.category}` : ""}
                    </span>
                  </span>
                  <Badge tone={REGISTRATION_TONE[r.status] ?? "neutral"} className="flex-none">
                    {REGISTRATION_LABEL[r.status] ?? r.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Event yang Saya Ajukan" count={data.submitted.ok ? `${data.submitted.data.length} event` : undefined}>
        {!data.submitted.ok ? (
          <ErrorState title="Event gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : data.submitted.data.length === 0 ? (
          <EmptyState
            title="Anda belum mengajukan event apapun"
            message="Ajukan event Anda sendiri, lalu terbitkan agar Agent lain bisa mendaftar."
            action={
              <LinkButton href={"/agent/event/baru" as Route} size="sm">
                Ajukan Event Pertama
              </LinkButton>
            }
          />
        ) : (
          <ul>
            {data.submitted.data.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3.5 border-b border-ink-50 py-3.5 last:border-b-0">
                <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-sm bg-gold-100 text-gold-700">
                  <CalendarIcon size={20} />
                </span>
                <span className="min-w-0 flex-1 basis-56">
                  <span className="block truncate text-body-md">{s.title}</span>
                  <span className="text-caption">
                    {formatDateTime(s.startAt)} · Registrasi: {APPROVAL_LABEL[s.approvalMode] ?? s.approvalMode}
                  </span>
                </span>
                <Badge tone={EVENT_STATUS_TONE[s.status] ?? "neutral"} className="flex-none">
                  {EVENT_STATUS_LABEL[s.status] ?? s.status}
                </Badge>
                <LinkButton href={`/agent/event/${s.id}` as Route} variant="secondary" size="sm">
                  Kelola
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
