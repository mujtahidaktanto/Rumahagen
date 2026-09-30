// components/partner/MyEventsView.tsx — daftar Ajukan Event Mitra (M05, wireframe 03-Developer-Partner/M05-Ajukan-Event-Mitra): pengajuan event milik sendiri. "Ubah" hanya untuk
// status Menunggu Persetujuan (canEditPartnerEvent) — Terbit/Ditolak/Dibatalkan hanya bisa dilihat (penerbitan dan pembatalan wewenang tim RumahAgen).
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BuildingIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import type { MySubmittedEvent } from "@/lib/partner/event-data";
import { EVENT_CATEGORY_LABEL, EVENT_STATUS_LABEL, EVENT_STATUS_TONE, canEditPartnerEvent } from "@/lib/partner/event-rules";
import type { Part } from "@/lib/agent/dashboard-data";

export function MyEventsView({ linked, events }: { linked: boolean; events: Part<MySubmittedEvent[]> }) {
  if (!linked) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Event</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Selama belum terhubung, proyek, marketing kit, dan klaim belum bisa dikelola.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Event</h1>
          <p className="text-body-md text-ink-500">Event Anda tidak langsung tayang. Tim RumahAgen meninjau setiap pengajuan mitra sebelum diterbitkan.</p>
        </div>
        <LinkButton href={"/partner/event/baru" as Route}>+ Ajukan Event</LinkButton>
      </div>

      {!events.ok ? (
        <ErrorState title="Event gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : events.data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Belum ada pengajuan event. Ajukan open house atau launching proyek Anda. Tim RumahAgen akan meninjau sebelum diterbitkan.</p>
          <div className="mt-4 flex justify-center">
            <LinkButton href={"/partner/event/baru" as Route}>+ Ajukan Event</LinkButton>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
          {events.data.map((e) => {
            const editable = canEditPartnerEvent(e.status);
            const body = (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-label-lg text-ink-900">{e.title}</div>
                  <div className="truncate text-caption">
                    {EVENT_CATEGORY_LABEL[e.category] ?? e.category} · {formatDateTime(e.startAt)}
                  </div>
                </div>
                <Badge tone={EVENT_STATUS_TONE[e.status] ?? "neutral"}>{EVENT_STATUS_LABEL[e.status] ?? e.status}</Badge>
              </>
            );
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-3 p-3.5">
                {body}
                {editable ? (
                  <Link href={`/partner/event/${e.id}` as Route} className="text-label-lg text-blue-600">
                    Ubah
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-caption">Anda hanya bisa mengubah pengajuan yang masih menunggu persetujuan. Penerbitan dan pembatalan event dilakukan tim RumahAgen.</p>
    </div>
  );
}
