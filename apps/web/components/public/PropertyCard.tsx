// components/public/PropertyCard.tsx — kartu listing publik (wireframe M11 prop-card): foto (atau kotak abu bila belum ada), label Dijual/Disewa, judul 1 baris, lokasi, harga,
// kamar tidur/mandi (bila ada) dan luas. Teks panjang dipotong (truncate) agar tinggi kartu tetap. Tombol favorit belum ada (butuh API favorit: lihat audit/FRONTEND_GAPS.md).
import Link from "next/link";
import type { Route } from "next";
import { AreaIcon, BathIcon, BedIcon, PinIcon } from "@/components/ui/icons";
import type { FeaturedListing } from "@/lib/public/home-data";
import { formatArea, formatListingPrice } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/media/variants";

const TAG = { sale: { label: "Dijual", cls: "bg-blue-600" }, rent: { label: "Disewa", cls: "bg-gold-600" } } as const;

export function PropertyCard({ listing: p }: { listing: FeaturedListing }) {
  const tag = TAG[p.transaction_type];
  const area = formatArea(p.building_area ?? p.land_area);
  const location = [p.cityName, p.provinceName].filter(Boolean).join(", ");
  return (
    <Link
      href={`/listing/${p.slug}` as Route}
      className="flex min-w-0 flex-col overflow-hidden rounded-md border border-ink-100 bg-white text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <div className="relative h-38 flex-none bg-ink-100">
        {p.coverUrl ? (
          // Foto listing dari storage (URL publik); gambar biasa tanpa optimasi Next agar tidak memakai kuota gambar Vercel.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listingPhotoUrl(p.coverUrl, "sm") ?? p.coverUrl} alt={p.coverAlt ?? p.title} loading="lazy" className="h-full w-full object-cover" />
        ) : null}
        <span className={`absolute top-2.5 left-2.5 rounded-pill px-2.5 py-0.5 text-[11px] font-bold text-white ${tag.cls}`}>{tag.label}</span>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <span className="truncate text-label-lg text-ink-900">{p.title}</span>
        {location ? (
          <span className="flex items-center gap-1.5 text-ink-500">
            <PinIcon size={13} className="flex-none" />
            <span className="truncate text-caption">{location}</span>
          </span>
        ) : null}
        <span className="text-title-md text-blue-600">{formatListingPrice(p.price, p.price_unit)}</span>
        <span className="mt-0.5 flex items-center gap-3 text-ink-500">
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
        </span>
      </div>
    </Link>
  );
}
