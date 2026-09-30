// components/instructor/MyEventsView.tsx — Event Saya (M05, wireframe 04-Instructor/M05-Event-Instruktur): daftar event yang diajukan sendiri. Tidak ada bagian "Event yang Saya
// Daftar" (beda dari Agent) — wireframe Instructor hanya punya tab "Event Saya" (yang diajukan) dan "Buat Event", tidak ada alur mendaftar ke event orang lain di layar ini. Server
// Component murni (tidak ada dialog, hanya Link ke halaman form/kelola terpisah).
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { CalendarIcon } from "@/components/ui/icons";
import type { MySubmittedEvent } from "@/lib/instructor/event-data";
import { EVENT_CATEGORY_LABEL, EVENT_STATUS_LABEL, EVENT_STATUS_TONE } from "@/lib/instructor/event-rules";
import { formatDateTime } from "@/lib/format";
import type { Part } from "@/lib/agent/dashboard-data";

export function MyEventsView({ events }: { events: Part<MySubmittedEvent[]> }) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Event Saya</h1>
          <p className="text-caption">Anda bisa menerbitkan event sendiri. Pembatalan event dilakukan tim RumahAgen.</p>
        </div>
        <LinkButton href={"/instructor/event/baru" as Route}>+ Buat Event</LinkButton>
      </div>

      <section className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
        {!events.ok ? (
          <ErrorState title="Event gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : events.data.length === 0 ? (
          <EmptyState
            title="Anda belum membuat event apapun"
            message="Buat event pertama Anda, lalu terbitkan agar terlihat publik."
            action={
              <LinkButton href={"/instructor/event/baru" as Route} size="sm">
                Buat Event Pertama
              </LinkButton>
            }
          />
        ) : (
          <ul>
            {events.data.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3.5 border-b border-ink-50 py-3.5 last:border-b-0">
                <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-sm bg-gold-100 text-gold-700">
                  <CalendarIcon size={20} />
                </span>
                <span className="min-w-0 flex-1 basis-56">
                  <span className="block truncate text-body-md">{e.title}</span>
                  <span className="text-caption">
                    {formatDateTime(e.startAt)} · {EVENT_CATEGORY_LABEL[e.category] ?? e.category}
                  </span>
                </span>
                <Badge tone={EVENT_STATUS_TONE[e.status] ?? "neutral"} className="flex-none">
                  {EVENT_STATUS_LABEL[e.status] ?? e.status}
                </Badge>
                <LinkButton href={`/instructor/event/${e.id}` as Route} variant="secondary" size="sm">
                  Kelola
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div>
        <Link href={"/event" as Route} className="text-label-lg text-blue-600">
          Jelajahi semua event publik
        </Link>
      </div>
    </div>
  );
}
