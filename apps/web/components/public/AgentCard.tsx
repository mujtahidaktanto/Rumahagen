// components/public/AgentCard.tsx — kartu agen pada daftar /agen: foto/inisial, nama (+ lencana Terverifikasi), kantor/organisasi, kota, spesialisasi, jumlah listing aktif. Seluruh kartu adalah tautan
// ke /agen/{slug}; teks panjang dipotong agar tinggi kartu tetap.
import Link from "next/link";
import type { Route } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PinIcon } from "@/components/ui/icons";
import type { PublicAgent } from "@/lib/public/agent-data";

export function AgentCard({ agent: a }: { agent: PublicAgent }) {
  const place = [a.city_name, a.province_name].filter(Boolean).join(", ");
  const org = [a.office_name, a.organization_name].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/agen/${a.public_slug}` as Route}
      className="flex h-full min-w-0 flex-col gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <div className="flex items-center gap-3">
        <Avatar name={a.full_name} imageUrl={a.avatar_url} size={56} />
        <div className="min-w-0">
          <div className="truncate text-title-md text-ink-900">{a.full_name}</div>
          {org ? <div className="truncate text-caption">{org}</div> : null}
        </div>
      </div>
      {a.is_verified ? (
        <Badge tone="info" className="self-start">
          Terverifikasi
        </Badge>
      ) : null}
      {place ? (
        <span className="flex items-center gap-1.5 text-ink-500">
          <PinIcon size={13} className="flex-none" />
          <span className="truncate text-caption">{place}</span>
        </span>
      ) : null}
      {a.specialization && a.specialization.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {a.specialization.slice(0, 3).map((s) => (
            <li key={s} className="rounded-pill bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
              {s}
            </li>
          ))}
        </ul>
      ) : null}
      <span className="mt-auto text-caption">
        <strong className="text-ink-900">{a.active_listings_count}</strong> listing aktif
      </span>
    </Link>
  );
}
