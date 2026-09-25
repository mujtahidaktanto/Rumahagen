// components/public/ListingDetailView.tsx — isi Detail Listing publik (M11 Detail-Listing): galeri, judul/harga, spesifikasi, deskripsi, fasilitas, lokasi, listing serupa, kartu agen (WhatsApp).
// Dipisah dari halaman agar bisa dilihat dengan data contoh di /komponen/listing (database staging belum punya listing terbit). Tidak membaca data sendiri.
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ListingGallery } from "@/components/public/ListingGallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { ShareButton } from "@/components/public/ShareButton";
import { ViewTracker } from "@/components/public/ViewTracker";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { AreaIcon, BathIcon, BedIcon, CheckCircleIcon, PinIcon } from "@/components/ui/icons";
import { formatArea, formatListingPrice, whatsappUrl } from "@/lib/format";
import type { FeaturedListing } from "@/lib/public/home-data";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL, type ListingAgent, type ListingDetail, type ListingStatus } from "@/lib/public/listing-detail";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "@/lib/public/listing-params";
import { buildListingWhatsAppMessage } from "@/lib/public/whatsapp-message";
import { SITE_URL } from "@/lib/seo/sitemap";

// Badge status = nilai CHECK listings.status; nada mengikuti wireframe (published success, sold/rented info, suspended danger, expired neutral).
const STATUS_TONE: Record<ListingStatus, BadgeTone> = {
  published: "success",
  sold: "info",
  rented: "info",
  suspended: "danger",
  expired: "neutral",
  draft: "neutral",
  pending_review: "warning",
  rejected: "danger",
};
const UNAVAILABLE_COPY: Partial<Record<ListingStatus, string>> = {
  sold: "Properti Ini Sudah Terjual",
  rented: "Properti Ini Sudah Disewa",
  suspended: "Listing Sedang Ditinjau",
  expired: "Listing Sudah Kedaluwarsa",
  draft: "Listing Belum Terbit",
  pending_review: "Listing Menunggu Peninjauan",
  rejected: "Listing Ditolak",
};

const r = (p: string) => p as Route;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

function Spec({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-body-md text-ink-700">
      <span className="flex-none text-ink-500">{icon}</span>
      {children}
    </li>
  );
}

function detailRows(l: ListingDetail): [string, string][] {
  const rows: [string, string | null][] = [
    ["Tipe properti", PROPERTY_TYPE_LABEL[l.property_type as PropertyType] ?? l.property_type],
    ["Sertifikat", l.certificate_type ? (CERTIFICATE_LABEL[l.certificate_type] ?? l.certificate_type) : null],
    ["IMB", l.imb_status ? (IMB_LABEL[l.imb_status] ?? l.imb_status) : null],
    ["Jumlah lantai", l.floors !== null ? String(l.floors) : null],
    ["Carport", l.carport_capacity !== null ? `${l.carport_capacity} mobil` : null],
    ["Daya listrik", l.electrical_power !== null ? `${new Intl.NumberFormat("id-ID").format(l.electrical_power)} VA` : null],
    ["Sumber air", l.water_source ? (WATER_LABEL[l.water_source] ?? l.water_source) : null],
    ["Perabot", l.furnishing ? (FURNISHING_LABEL[l.furnishing] ?? l.furnishing) : null],
    ["Tahun dibangun", l.year_built !== null ? String(l.year_built) : null],
    ["Harga", l.is_negotiable ? "Bisa nego" : null],
  ];
  return rows.filter((x): x is [string, string] => x[1] !== null);
}

export function ListingDetailView({ listing: l, agent, similar, track = true }: { listing: ListingDetail; agent: ListingAgent | null; similar: FeaturedListing[]; track?: boolean }) {
  const published = l.status === "published";
  const location = [l.address, l.districtName, l.cityName, l.provinceName].filter(Boolean).join(", ");
  const area = { building: formatArea(l.building_area), land: formatArea(l.land_area) };
  const wa = whatsappUrl(
    l.whatsapp_number ?? agent?.whatsapp_number,
    buildListingWhatsAppMessage({
      agentName: agent?.full_name,
      title: l.title,
      slug: l.slug,
      id: l.id,
      price: l.price,
      priceUnit: l.price_unit,
      transactionType: l.transaction_type,
      propertyTypeLabel: PROPERTY_TYPE_LABEL[l.property_type as PropertyType] ?? l.property_type,
      cityName: l.cityName,
      provinceName: l.provinceName,
      siteUrl: SITE_URL,
    }),
  );
  const showCta = published && wa !== null && (agent ? agent.public_cta_enabled : true);
  const mapsUrl = l.latitude !== null && l.longitude !== null ? `https://www.google.com/maps?q=${l.latitude},${l.longitude}` : null;
  const details = detailRows(l);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      {published && track ? <ViewTracker listingId={l.id} /> : null}

      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={r("/listing")} className="text-ink-500">
          Listing
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {l.title}
        </span>
      </nav>

      <ListingGallery
        photos={l.photos}
        title={l.title}
        overlay={
          published ? undefined : (
            <Badge tone={l.status === "suspended" || l.status === "rejected" ? "danger" : "info"} className="px-5 py-2.5 text-[16px]">
              {UNAVAILABLE_COPY[l.status] ?? l.status}
            </Badge>
          )
        }
      />

      <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <Badge tone={STATUS_TONE[l.status]} className="self-start">
            {l.status}
          </Badge>
          <h1 className="text-headline break-words">{l.title}</h1>
          <p className="flex items-start gap-1.5 text-body-md text-ink-500">
            <PinIcon size={15} className="mt-0.5 flex-none" />
            <span>{location}</span>
          </p>
        </div>
        <div className="flex flex-none items-center justify-between gap-3 md:flex-col md:items-end">
          <span className="text-[28px] leading-9 font-extrabold text-blue-600">{formatListingPrice(l.price, l.price_unit)}</span>
          <ShareButton title={l.title} />
        </div>
      </div>

      {l.bedrooms !== null || l.bathrooms !== null || area.building || area.land ? (
        <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-y border-ink-100 py-5">
          {l.bedrooms !== null ? <Spec icon={<BedIcon size={19} />}>{l.bedrooms} Kamar Tidur</Spec> : null}
          {l.bathrooms !== null ? <Spec icon={<BathIcon size={19} />}>{l.bathrooms} Kamar Mandi</Spec> : null}
          {area.building ? <Spec icon={<AreaIcon size={19} />}>Luas Bangunan {area.building}</Spec> : null}
          {area.land ? <Spec icon={<AreaIcon size={19} />}>Luas Tanah {area.land}</Spec> : null}
        </ul>
      ) : null}

      <div className="grid items-start gap-8 pt-8 pb-14 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title="Deskripsi">
            {l.description ? (
              <p className="text-body-lg whitespace-pre-line break-words text-ink-700" style={{ lineHeight: "26px" }}>
                {l.description}
              </p>
            ) : (
              <p className="text-body-md text-ink-500">Agen belum menambahkan deskripsi.</p>
            )}
          </Section>

          {details.length > 0 ? (
            <Section title="Spesifikasi">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-ink-50 pb-2">
                    <dt className="text-body-md text-ink-500">{k}</dt>
                    <dd className="text-body-md font-semibold text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : null}

          {l.amenities.length > 0 ? (
            <Section title="Fasilitas">
              <ul className="flex flex-wrap gap-2.5">
                {l.amenities.map((a) => (
                  <li key={a} className="inline-flex items-center gap-2 rounded-pill bg-success-100 px-3.5 py-2 text-[13px] font-bold text-success-600">
                    <CheckCircleIcon size={15} />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="Lokasi">
            <p className="text-body-md text-ink-700">{location}</p>
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-label-lg">
                Buka di Google Maps →
              </a>
            ) : null}
          </Section>

          {similar.length > 0 ? (
            <Section title="Listing Serupa">
              <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
                {similar.map((p) => (
                  <li key={p.id} className="flex">
                    <div className="flex w-full flex-col [&>a]:h-full">
                      <PropertyCard listing={p} />
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>

        <aside aria-label="Agen" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          {agent ? (
            <div className="flex items-center gap-3">
              <Avatar name={agent.full_name} imageUrl={agent.avatar_url} size={52} />
              <div className="min-w-0">
                <div className="truncate text-title-md">{agent.full_name}</div>
                {agent.organization_name ? <div className="truncate text-caption">{agent.organization_name}</div> : null}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
                  {agent.is_verified ? <Badge tone="success">Terverifikasi</Badge> : null}
                  <span>{agent.active_listings_count} listing aktif</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-body-md text-ink-500">Listing ini dikelola oleh agen RumahAgen.</p>
          )}
          {showCta && wa ? (
            <WhatsAppButton listingId={l.id} href={wa} className="w-full" />
          ) : (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">
              {published ? "Kontak agen belum tersedia untuk listing ini." : "Listing ini sedang tidak tersedia, sehingga kontak agen tidak ditampilkan."}
            </p>
          )}
          {agent?.public_slug ? (
            <Link href={r(`/agen/${agent.public_slug}`)} className="min-h-11 text-label-lg leading-[44px]">
              Lihat profil agen →
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
