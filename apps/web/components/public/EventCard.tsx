// components/public/EventCard.tsx — kartu event pada daftar /event: kotak tanggal (bulan + tanggal), kategori, judul, penyelenggara, format (online/lokasi), dan jam. Seluruh kartu adalah tautan ke /event/{id}.
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { PinIcon } from "@/components/ui/icons";
import { dateBox, formatTimeRange } from "@/lib/format";
import { EVENT_CATEGORY_LABEL, type EventSummary } from "@/lib/public/event-data";

export function DateBox({ iso, className = "" }: { iso: string; className?: string }) {
  const b = dateBox(iso);
  return (
    <span aria-hidden="true" className={`flex flex-none flex-col items-center justify-center rounded-md bg-blue-100 text-blue-600 ${className}`}>
      <span className="text-[11px] font-bold">{b.month}</span>
      <span className="text-[18px] leading-5 font-extrabold">{b.day}</span>
    </span>
  );
}

export function EventCard({ event: e }: { event: EventSummary }) {
  return (
    <Link
      href={`/event/${e.id}` as Route}
      className="flex h-full min-w-0 gap-3.5 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <DateBox iso={e.start_at} className="h-14 w-14" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Badge tone="info" dot={false} className="self-start">
          {EVENT_CATEGORY_LABEL[e.category] ?? e.category}
        </Badge>
        <span className="line-clamp-2 text-title-md text-ink-900">{e.title}</span>
        {e.host ? <span className="truncate text-caption">Oleh {e.host}</span> : null}
        <span className="flex items-center gap-1.5 text-ink-500">
          <PinIcon size={13} className="flex-none" />
          <span className="truncate text-caption">{e.is_online ? "Online" : (e.location ?? "Lokasi belum ditentukan")}</span>
        </span>
        <span className="text-caption">{formatTimeRange(e.start_at, e.end_at)}</span>
      </div>
    </Link>
  );
}
