// components/agent/MyListingDetailView.tsx — Detail Listing milik Agent (M03 Listing-Detail, wireframe 01-Agent/M03-Listing-Detail): spanduk menurut status, aksi, media, spesifikasi (dengan
// catatan "terkunci sejak publikasi pertama"), deskripsi, fasilitas, leads masuk, statistik, dan Refresh Listing. Lead dan kuota refresh punya keadaan gagal sendiri.
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { ListingActions, RefreshCard } from "@/components/agent/ListingActions";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ListingStatusBadge } from "@/components/ui/StatusBadge";
import { BuildingIcon, InfoIcon, LockIcon, PinIcon } from "@/components/ui/icons";
import { detailActions, leadSourceLabel, LEAD_STATUS, refreshState } from "@/lib/agent/listing-rules";
import type { MyListingDetail, MyListingDetailResult } from "@/lib/agent/listing-detail-data";
import { relativeTimeId } from "@/lib/agent/time";
import { formatArea, formatListingPrice } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/public/listing-params";
import { CERTIFICATE_LABEL } from "@/lib/public/listing-labels";

const nf = new Intl.NumberFormat("id-ID");
type Ok = Extract<MyListingDetailResult, { state: "ok" }>;

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Banner({ tone, title, children }: { tone: "info" | "warn" | "danger" | "neutral"; title?: string; children: ReactNode }) {
  const cls = { info: "border-blue-200 bg-info-100", warn: "border-warning-600/30 bg-warning-100", danger: "border-danger-600/30 bg-danger-100", neutral: "border-ink-100 bg-ink-50" }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-3 rounded-md border p-4 ${cls}`}>
      <InfoIcon size={18} className="mt-0.5 flex-none text-ink-500" />
      <div className="min-w-0">
        {title ? <p className="text-label-lg text-ink-900">{title}</p> : null}
        <div className="text-body-md text-ink-700">{children}</div>
      </div>
    </div>
  );
}

function statusBanner(l: MyListingDetail): ReactNode {
  switch (l.status) {
    case "pending_review":
      return <Banner tone="info">Sekadar informasi — listing ini sedang ditinjau tim kami pasca-publikasi. Tetap tayang normal, tidak ada fitur yang dibatasi.</Banner>;
    case "rejected":
      return (
        <Banner tone="danger" title="Listing Ditolak">
          {l.rejectionReason || "Listing ini ditolak oleh tim moderasi."} Perbaiki data listing lalu ajukan ulang.
        </Banner>
      );
    case "suspended":
      return (
        <Banner tone="danger" title="Listing Dibekukan Admin">
          Listing ini disembunyikan dari pencarian publik oleh tim moderasi. Hubungi Pusat Bantuan untuk info lebih lanjut.
        </Banner>
      );
    case "draft":
      return <Banner tone="warn">Listing ini masih draft dan belum tayang publik.</Banner>;
    case "sold":
      return <Banner tone="neutral" title="Properti Ini Sudah Terjual">Listing tidak tampil di pencarian publik.</Banner>;
    case "rented":
      return <Banner tone="neutral" title="Properti Ini Sudah Disewa">Listing tidak tampil di pencarian publik.</Banner>;
    case "expired":
      return <Banner tone="neutral" title="Listing Sudah Kedaluwarsa">Masa tayang berakhir. Listing tidak tampil di pencarian publik.</Banner>;
    default:
      return null;
  }
}

function Spec({ label, value, locked }: { label: string; value: ReactNode; locked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-50 py-2.5 last:border-b-0">
      <dt className="flex items-center gap-1.5 text-caption">
        {label}
        {locked ? <LockIcon size={12} aria-label="Terkunci sejak publikasi pertama" /> : null}
      </dt>
      <dd className="text-right text-body-md font-bold">{value}</dd>
    </div>
  );
}

export function MyListingDetailView({ data, now = new Date() }: { data: Ok; now?: Date }) {
  const l = data.listing;
  const actions = detailActions(l);
  const rq = data.refresh.ok ? data.refresh.data : "gagal";
  const rState = refreshState(l, rq, now);
  const locked = l.publishedAt !== null;
  const priceText = `${formatListingPrice(l.price, l.priceUnit)}${l.isNegotiable ? " (nego)" : ""}`;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
        <Link href={"/agent/listing" as Route} className="text-ink-500">
          Listing Saya
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {l.title}
        </span>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <ListingStatusBadge status={l.status} className="self-start" />
            <h1 className="text-headline break-words">{l.title}</h1>
            {l.location ? (
              <p className="flex items-center gap-1.5 text-body-md text-ink-500">
                <PinIcon size={15} className="flex-none" />
                <span>{l.location}</span>
              </p>
            ) : null}
            <p className="text-title-lg text-blue-600">{priceText}</p>
          </div>
          {l.status === "published" ? (
            <LinkButton href={`/listing/${l.slug}` as Route} variant="secondary" size="sm" target="_blank" rel="noopener">
              Lihat di Halaman Publik
            </LinkButton>
          ) : null}
        </div>
        <ListingActions id={l.id} title={l.title} actions={actions} />
      </header>

      {statusBanner(l)}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card
            title="Media"
            right={
              <LinkButton href={`/agent/listing/${l.id}/edit?langkah=media` as Route} variant="secondary" size="sm">
                Kelola Media
              </LinkButton>
            }
          >
            {l.photos.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md bg-ink-50 text-ink-300">
                <BuildingIcon size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {l.photos.slice(0, 6).map((p, i) => (
                  // Foto listing dari data (URL tersimpan); gambar biasa tanpa optimasi Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.url + i} src={p.url} alt={p.alt ?? ""} className={`w-full rounded-sm bg-ink-100 object-cover ${i === 0 ? "col-span-3 h-56 sm:h-72" : "h-20 sm:h-28"}`} />
                ))}
              </div>
            )}
            <p className="text-caption">{l.photos.length} foto · foto pertama menjadi sampul.</p>
          </Card>

          <Card title="Spesifikasi" right={locked ? <Badge tone="neutral" dot={false}>Terkunci sejak publikasi pertama</Badge> : undefined}>
            <dl>
              <Spec label="Tipe Properti" value={PROPERTY_TYPE_LABEL[l.propertyType as keyof typeof PROPERTY_TYPE_LABEL] ?? l.propertyType} locked={locked} />
              <Spec label="Alamat" value={l.address} locked={locked} />
              {l.landArea !== null ? <Spec label="Luas Tanah" value={formatArea(l.landArea)} locked={locked} /> : null}
              {l.buildingArea !== null ? <Spec label="Luas Bangunan" value={formatArea(l.buildingArea)} locked={locked} /> : null}
              {l.bedrooms !== null ? <Spec label="Kamar Tidur" value={l.bedrooms} /> : null}
              {l.bathrooms !== null ? <Spec label="Kamar Mandi" value={l.bathrooms} /> : null}
              {l.floors !== null ? <Spec label="Jumlah Lantai" value={l.floors} /> : null}
              {l.carportCapacity !== null ? <Spec label="Carport" value={l.carportCapacity} /> : null}
              {l.certificateType ? <Spec label="Sertifikat" value={CERTIFICATE_LABEL[l.certificateType] ?? l.certificateType} /> : null}
            </dl>
          </Card>

          <Card title="Deskripsi">
            {l.description ? <p className="whitespace-pre-line break-words text-body-md text-ink-700">{l.description}</p> : <p className="text-body-md text-ink-500">Belum ada deskripsi.</p>}
          </Card>

          {l.amenities.length > 0 ? (
            <Card title="Fasilitas">
              <ul className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <li key={a} className="rounded-pill bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-600">
                    {a}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card title="Leads Masuk" right={data.leads.ok ? <span className="text-caption">{nf.format(data.leads.data.total)} total</span> : undefined}>
            {!data.leads.ok ? (
              <ErrorState title="Leads gagal dimuat" message="Muat ulang halaman beberapa saat lagi." className="py-6" />
            ) : data.leads.data.items.length === 0 ? (
              <EmptyState title="Belum ada leads" message="Belum ada leads masuk untuk listing ini." className="py-6" />
            ) : (
              <ul>
                {data.leads.data.items.map((x) => {
                  const st = LEAD_STATUS[x.status] ?? { label: x.status, tone: "neutral" as const };
                  return (
                    <li key={x.id} className="flex items-center justify-between gap-3 border-b border-ink-50 py-2.5 last:border-b-0">
                      <span className="min-w-0">
                        <span className="block truncate text-body-md text-ink-900">{leadSourceLabel(x.source)}</span>
                        <span className="text-caption">{relativeTimeId(x.createdAt, now)}</span>
                      </span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
          <section aria-label="Statistik" className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
            <h2 className="text-title-md">Statistik</h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div>
                <dd className="text-title-lg">{nf.format(l.viewCount)}</dd>
                <dt className="text-caption">Dilihat</dt>
              </div>
              <div>
                <dd className="text-title-lg">{nf.format(l.ctaClickCount)}</dd>
                <dt className="text-caption">Klik CTA</dt>
              </div>
              <div>
                <dd className="text-title-lg">{data.leads.ok ? nf.format(data.leads.data.total) : "—"}</dd>
                <dt className="text-caption">Leads</dt>
              </div>
            </dl>
          </section>
          <RefreshCard id={l.id} state={rState} used={data.refresh.ok && data.refresh.data ? data.refresh.data.usedToday : null} allowance={data.refresh.ok && data.refresh.data ? data.refresh.data.allowance : null} lastRefreshedAt={l.lastRefreshedAt} />
        </aside>
      </div>
    </div>
  );
}
