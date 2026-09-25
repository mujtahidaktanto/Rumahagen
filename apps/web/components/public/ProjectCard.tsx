// components/public/ProjectCard.tsx — kartu proyek developer pada daftar /developer: foto (atau kotak abu), label status, nama, developer, lokasi, rentang harga, ketersediaan, kamar/luas.
// Teks panjang dipotong. Seluruh kartu adalah tautan ke /project/{slug}. Komisi tidak pernah tampil di sini.
import Link from "next/link";
import type { Route } from "next";
import { AreaIcon, BathIcon, BedIcon, PinIcon } from "@/components/ui/icons";
import { formatArea, formatPriceRange } from "@/lib/format";
import { PROJECT_STATUS_LABEL, type ProjectSummary } from "@/lib/public/project-data";

const STATUS_CLS: Record<string, string> = { active: "bg-blue-600", coming_soon: "bg-gold-600", sold_out: "bg-ink-500" };

export function ProjectCard({ project: p }: { project: ProjectSummary }) {
  const area = formatArea(p.building_area ?? p.land_area);
  return (
    <Link
      href={`/project/${p.slug}` as Route}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-ink-100 bg-white text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <div className="relative h-38 flex-none bg-ink-100">
        {p.coverUrl ? (
          // Foto proyek dari storage/URL publik; gambar biasa tanpa optimasi Next agar tidak memakai kuota gambar Vercel.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : null}
        <span className={`absolute top-2.5 left-2.5 rounded-pill px-2.5 py-0.5 text-[11px] font-bold text-white ${STATUS_CLS[p.status] ?? "bg-ink-500"}`}>{PROJECT_STATUS_LABEL[p.status] ?? p.status}</span>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <span className="truncate text-label-lg text-ink-900">{p.name}</span>
        {p.developerName ? <span className="truncate text-caption">{p.developerName}</span> : null}
        {p.location ? (
          <span className="flex items-center gap-1.5 text-ink-500">
            <PinIcon size={13} className="flex-none" />
            <span className="truncate text-caption">{p.location}</span>
          </span>
        ) : null}
        <span className="text-title-md break-words text-blue-600">{formatPriceRange(p.price_min, p.price_max, p.price_unit)}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-500">
          {p.bedrooms !== null ? (
            <span className="flex items-center gap-1">
              <BedIcon size={13} />
              <span className="text-caption">{p.bedrooms}</span>
            </span>
          ) : null}
          {p.bathrooms !== null ? (
            <span className="flex items-center gap-1">
              <BathIcon size={13} />
              <span className="text-caption">{p.bathrooms}</span>
            </span>
          ) : null}
          {area ? (
            <span className="flex items-center gap-1">
              <AreaIcon size={13} />
              <span className="text-caption">{area}</span>
            </span>
          ) : null}
          {p.unit_availability !== null ? <span className="text-caption">{p.unit_availability > 0 ? `${p.unit_availability} unit tersedia` : "Unit habis"}</span> : null}
        </span>
      </div>
    </Link>
  );
}
