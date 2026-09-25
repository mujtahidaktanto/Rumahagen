// components/public/ProjectDetailView.tsx — isi Detail Proyek Developer publik (M11 Detail-Developer-Project): galeri, judul/kategori/harga, spesifikasi, deskripsi, Legalitas & Kepercayaan, Spesifikasi Detail, lokasi,
// kartu Developer (logo, nama, tentang, WhatsApp PIC), dan panel kemitraan: Agent yang login melihat "Info Kemitraan Agen" (skema komisi + Klaim Proyek Ini), pengunjung melihat ajakan masuk, peran lain tidak melihat panel.
// Komisi hanya dibaca server untuk Agent (lib/public/project-data.getProjectPartnership) dan diteruskan lewat prop `partnership`.
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { EnrollButton } from "@/components/public/EnrollButton";
import { ListingGallery } from "@/components/public/ListingGallery";
import { RichText } from "@/components/public/RichText";
import { ShareButton } from "@/components/public/ShareButton";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { AreaIcon, BathIcon, BedIcon, CheckCircleIcon, PinIcon } from "@/components/ui/icons";
import { formatArea, formatPriceRange, whatsappUrl } from "@/lib/format";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL } from "@/lib/public/listing-detail";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "@/lib/public/listing-params";
import { CLAIM_STATUS_LABEL, PROJECT_STATUS_LABEL, type Partnership, type ProjectDetail } from "@/lib/public/project-data";
import { safeHref } from "@/lib/public/promo-data";
import { buildProjectWhatsAppMessage } from "@/lib/public/whatsapp-message";
import { SITE_URL } from "@/lib/seo/sitemap";
import { initialsOf } from "@/lib/initials";

export type Viewer = "guest" | "agent" | "other";

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

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-pill bg-success-100 px-3.5 py-2 text-[13px] font-bold text-success-600">
      <CheckCircleIcon size={15} />
      {children}
    </li>
  );
}

export function ProjectDetailView({ project: p, viewer, partnership }: { project: ProjectDetail; viewer: Viewer; partnership: Partnership | null }) {
  const location = [p.location, p.districtName, p.cityName, p.provinceName].filter(Boolean).join(", ");
  const dev = p.developer;
  const priceLabel = formatPriceRange(p.price_min, p.price_max, p.price_unit);
  const wa = dev?.pic_contact
    ? whatsappUrl(dev.pic_contact, buildProjectWhatsAppMessage({ picName: dev.pic_name, projectName: p.name, slug: p.slug, location: p.location, priceLabel, siteUrl: SITE_URL }))
    : null;
  const logo = safeHref(dev?.company_logo);
  const mapsUrl = p.latitude !== null && p.longitude !== null ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}` : null;
  const overlay =
    p.status === "sold_out" || p.status === "coming_soon" ? (
      <Badge tone={p.status === "sold_out" ? "neutral" : "info"} className="px-5 py-2.5 text-[16px]">
        {PROJECT_STATUS_LABEL[p.status]}
      </Badge>
    ) : undefined;
  const area = { building: formatArea(p.building_area), land: formatArea(p.land_area) };
  const detailRows: [string, string][] = (
    [
      ["Tahun Dibangun", p.year_built !== null ? String(p.year_built) : null],
      ["Perabotan", p.furnishing ? (FURNISHING_LABEL[p.furnishing] ?? p.furnishing) : null],
      ["Sumber Air", p.water_source ? (WATER_LABEL[p.water_source] ?? p.water_source) : null],
      ["Daya Listrik", p.electrical_power !== null ? `${new Intl.NumberFormat("id-ID").format(p.electrical_power)} VA` : null],
      ["Jumlah Lantai", p.floors !== null ? String(p.floors) : null],
      ["Carport", p.carport_capacity !== null ? `${p.carport_capacity} mobil` : null],
    ] as [string, string | null][]
  ).filter((x): x is [string, string] => x[1] !== null);
  const validVideos = p.videos.map((v) => safeHref(v)).filter((v): v is string => !!v && v.startsWith("https://"));

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={r("/developer")} className="text-ink-500">
          Developer
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {p.name}
        </span>
      </nav>

      <ListingGallery photos={p.photos} title={p.name} overlay={overlay} />

      <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info" dot={false}>
              {p.category === "primary" ? "Proyek Baru (Primary)" : "Secondary"}
            </Badge>
            <Badge tone="neutral" dot={false}>
              {p.transaction_type === "sale" ? "Dijual" : "Disewa"} · {PROPERTY_TYPE_LABEL[p.property_type as PropertyType] ?? p.property_type}
            </Badge>
          </div>
          <h1 className="text-headline break-words">{p.name}</h1>
          {location ? (
            <p className="flex items-start gap-1.5 text-body-md text-ink-500">
              <PinIcon size={15} className="mt-0.5 flex-none" />
              <span>{location}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-none items-center justify-between gap-3 md:flex-col md:items-end">
          <div className="flex flex-col md:items-end">
            <span className="text-[26px] leading-9 font-extrabold break-words text-blue-600">{priceLabel}</span>
            {p.unit_availability !== null ? <span className="text-caption">{p.unit_availability > 0 ? `${p.unit_availability} unit tersedia` : "Unit habis"}</span> : null}
          </div>
          <ShareButton title={p.name} />
        </div>
      </div>

      {p.bedrooms !== null || p.bathrooms !== null || area.building || area.land ? (
        <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-y border-ink-100 py-5">
          {p.bedrooms !== null ? <Spec icon={<BedIcon size={19} />}>{p.bedrooms} KT</Spec> : null}
          {p.bathrooms !== null ? <Spec icon={<BathIcon size={19} />}>{p.bathrooms} KM</Spec> : null}
          {area.building ? <Spec icon={<AreaIcon size={19} />}>LB {area.building}</Spec> : null}
          {area.land ? <Spec icon={<AreaIcon size={19} />}>LT {area.land}</Spec> : null}
        </ul>
      ) : null}

      <div className="grid items-start gap-8 pt-8 pb-14 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title="Deskripsi">
            <RichText text={p.meta_description} empty="Developer belum menambahkan deskripsi proyek." />
          </Section>

          <Section title="Legalitas & Kepercayaan">
            <ul className="flex flex-wrap gap-2.5">
              {p.certificate_type ? <Chip>Sertifikat {CERTIFICATE_LABEL[p.certificate_type] ?? p.certificate_type}</Chip> : null}
              {p.certificate_transferred ? <Chip>Sertifikat Bisa Dibalik Nama</Chip> : null}
              {p.imb_status ? <Chip>IMB {IMB_LABEL[p.imb_status] ?? p.imb_status}</Chip> : null}
              {p.dispute_free_declared ? <Chip>Bebas Sengketa</Chip> : null}
            </ul>
            {!p.certificate_type && !p.imb_status && !p.certificate_transferred && !p.dispute_free_declared ? <p className="text-body-md text-ink-500">Informasi legalitas belum ditambahkan.</p> : null}
          </Section>

          {detailRows.length > 0 ? (
            <Section title="Spesifikasi Detail">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {detailRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-ink-50 pb-2">
                    <dt className="text-body-md text-ink-500">{k}</dt>
                    <dd className="text-body-md font-semibold text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : null}

          {validVideos.length > 0 ? (
            <Section title="Video">
              <ul className="flex flex-col gap-2">
                {validVideos.map((v, i) => (
                  <li key={v}>
                    <a href={v} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-label-lg">
                      Tonton video {validVideos.length > 1 ? i + 1 : ""} →
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="Lokasi">
            <p className="text-body-md text-ink-700">{location || "Lokasi belum ditambahkan."}</p>
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-label-lg">
                Buka di Google Maps →
              </a>
            ) : null}
          </Section>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <aside aria-label="Developer" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2">
            {dev ? (
              <>
                <div className="flex items-center gap-3">
                  {logo ? (
                    // Logo dari data (jalur situs atau https); gambar biasa tanpa optimasi Next.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-13 w-13 flex-none rounded-sm border border-ink-100 bg-white object-contain" />
                  ) : (
                    <span aria-hidden="true" className="flex h-13 w-13 flex-none items-center justify-center rounded-sm bg-blue-100 font-bold text-blue-600">
                      {initialsOf(dev.company_name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-title-md">{dev.company_name}</div>
                    <div className="text-caption">Developer Partner</div>
                  </div>
                </div>
                {dev.description ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-label-md text-ink-500">Tentang Developer</span>
                    <p className="line-clamp-3 text-body-md text-ink-700">{dev.description}</p>
                  </div>
                ) : null}
                {wa ? (
                  <WhatsAppButton href={wa} className="w-full" />
                ) : dev.pic_contact ? (
                  <p className="text-body-md text-ink-700">Kontak: {dev.pic_contact}</p>
                ) : (
                  <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Kontak developer belum tersedia.</p>
                )}
              </>
            ) : (
              <p className="text-body-md text-ink-500">Informasi developer belum tersedia.</p>
            )}
          </aside>

          {viewer === "agent" && partnership ? (
            <aside aria-label="Info kemitraan agen" className="flex flex-col gap-3 rounded-lg border border-gold-200 bg-gold-100 p-5">
              <span className="text-label-lg text-gold-700">Info Kemitraan Agen</span>
              <dl className="flex flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-body-md">Skema Komisi</dt>
                  <dd className="text-right text-body-md font-bold break-words">{partnership.commission_scheme || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-body-md">Komisi Tambahan</dt>
                  <dd className="text-right text-body-md font-bold break-words">{partnership.extra_commission || "—"}</dd>
                </div>
              </dl>
              {partnership.claimStatus === "pending" || partnership.claimStatus === "approved" ? (
                <p role="status" className="rounded-md bg-success-100 p-3 text-body-md text-success-600">
                  Klaim Anda: {CLAIM_STATUS_LABEL[partnership.claimStatus]}.
                </p>
              ) : partnership.claimStatus ? (
                <p role="status" className="rounded-md bg-white p-3 text-body-md text-ink-700">
                  Klaim Anda sebelumnya: {CLAIM_STATUS_LABEL[partnership.claimStatus] ?? partnership.claimStatus}. Hubungi tim RumahAgen bila ingin mengajukan kembali.
                </p>
              ) : p.status === "active" ? (
                <EnrollButton endpoint={`/developer-projects/${p.id}/claim`} label="Klaim Proyek Ini" doneMessage="Klaim Anda tercatat dan menunggu peninjauan developer." />
              ) : (
                <p className="rounded-md bg-white p-3 text-body-md text-ink-500">Proyek ini belum bisa diklaim ({PROJECT_STATUS_LABEL[p.status] ?? p.status}).</p>
              )}
            </aside>
          ) : null}

          {viewer === "guest" ? (
            <aside aria-label="Untuk agen" className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-5">
              <span className="text-label-lg text-blue-700">Anda Seorang Agen?</span>
              <p className="text-body-md text-ink-700">Masuk sebagai agen untuk melihat skema komisi dan klaim proyek ini.</p>
              <LinkButton href={`/login?next=${encodeURIComponent(`/project/${p.slug}`)}` as Route} className="w-full">
                Masuk sebagai Agen
              </LinkButton>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
