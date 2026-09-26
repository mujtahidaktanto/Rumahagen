// components/public/AgentDetailView.tsx — isi Detail Agen publik (M11 Detail-Agen): kepala profil (foto, nama, lencana, kantor/organisasi, lokasi, spesialisasi, statistik), Title & Penghargaan
// (1 utama + maks. 3 tambahan), Tentang, Portofolio Listing, dan kartu Hubungi Agen (WhatsApp selalu tampil + nomor lisensi). Ulasan (agent_reviews approved, 10 terbaru) dan peringkat rata-rata di kepala profil.
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { PropertyCard } from "@/components/public/PropertyCard";
import { ShareButton } from "@/components/public/ShareButton";
import { RatingStars } from "@/components/public/RatingStars";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PinIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";
import { formatDate, whatsappUrl } from "@/lib/format";
import type { PublicAgent } from "@/lib/public/agent-data";
import { reviewerLabel, type AgentReviewsResult } from "@/lib/public/agent-reviews";
import type { FeaturedListing } from "@/lib/public/home-data";
import { buildAgentWhatsAppMessage } from "@/lib/public/whatsapp-message";
import { SITE_URL } from "@/lib/seo/sitemap";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-title-lg">{new Intl.NumberFormat("id-ID").format(value)}</span>
      <span className="text-caption">{label}</span>
    </div>
  );
}

export function AgentDetailView({ agent: a, listings, listingsOk, reviews }: { agent: PublicAgent; listings: FeaturedListing[]; listingsOk: boolean; reviews: AgentReviewsResult }) {
  const place = [a.city_name, a.province_name].filter(Boolean).join(", ");
  const org = [a.office_name, a.organization_name].filter(Boolean).join(" · ");
  const wa = whatsappUrl(a.whatsapp_number, buildAgentWhatsAppMessage({ agentName: a.full_name, slug: a.public_slug, siteUrl: SITE_URL }));
  const additional = a.additional_titles ?? [];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/agen" as Route} className="text-ink-500">
          Agen
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {a.full_name}
        </span>
      </nav>

      <div className="grid items-start gap-8 pt-6 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-5 rounded-lg border border-ink-100 bg-white p-5 sm:flex-row sm:p-6">
            <Avatar name={a.full_name} imageUrl={a.avatar_url} size={96} className="self-start" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-headline break-words">{a.full_name}</h1>
                {a.is_verified ? <Badge tone="info">Terverifikasi</Badge> : null}
                <ShareButton title={`${a.full_name} — Agen Properti | RumahAgen`} text={`Lihat profil ${a.full_name}, agen properti di RumahAgen.`} label="Bagikan Profil" className="sm:ml-auto" />
              </div>
              {org ? <p className="text-body-md text-ink-700">{org}</p> : null}
              {place || a.coverage_area ? (
                <p className="flex items-start gap-1.5 text-body-md text-ink-500">
                  <PinIcon size={15} className="mt-0.5 flex-none" />
                  <span>{[place, a.coverage_area ? `Area: ${a.coverage_area}` : null].filter(Boolean).join(" · ")}</span>
                </p>
              ) : null}
              {a.specialization && a.specialization.length > 0 ? (
                <ul aria-label="Spesialisasi" className="flex flex-wrap gap-2">
                  {a.specialization.map((s) => (
                    <li key={s} className="rounded-pill bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-600">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-ink-100 pt-4">
                <Stat value={a.active_listings_count} label="Listing Aktif" />
                <Stat value={a.total_listings_sold} label="Listing Terjual" />
                <Stat value={a.total_listings_rented} label="Listing Tersewa" />
                {reviews.ok && reviews.summary.average !== null ? (
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1 text-title-lg">
                      <StarIcon size={18} className="fill-current text-gold-700" />
                      {reviews.summary.average.toFixed(1)}
                    </span>
                    <span className="text-caption">{new Intl.NumberFormat("id-ID").format(reviews.summary.count)} ulasan</span>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {a.primary_title || additional.length > 0 ? (
            <Section title="Title & Penghargaan">
              <div className="flex flex-col gap-3">
                {a.primary_title ? (
                  <div className="flex items-center gap-3 rounded-md border border-gold-200 bg-gold-100 p-4">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-gold-700">
                      <TrophyIcon size={22} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-caption text-gold-700">Title Utama</span>
                      <div className="text-title-lg break-words">{a.primary_title.name}</div>
                      {a.primary_title.issued_at ? <span className="text-caption">Diterima {formatDate(a.primary_title.issued_at)}</span> : null}
                    </div>
                  </div>
                ) : null}
                {additional.length > 0 ? (
                  <ul className="flex flex-wrap gap-2.5">
                    {additional.map((t) => (
                      <li key={t.code} className="inline-flex items-center gap-2 rounded-pill border border-ink-100 bg-white px-3.5 py-2 text-[13px] font-bold text-ink-700">
                        <TrophyIcon size={15} className="text-gold-700" />
                        {t.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Section>
          ) : null}

          <Section title="Tentang">
            {a.bio ? (
              <p className="text-body-lg whitespace-pre-line break-words text-ink-700" style={{ lineHeight: "26px" }}>
                {a.bio}
              </p>
            ) : (
              <p className="text-body-md text-ink-500">Agen ini belum menambahkan deskripsi diri.</p>
            )}
          </Section>

          <Section title="Portofolio Listing">
            {!listingsOk ? (
              <ErrorState title="Listing belum bisa dimuat" message="Terjadi gangguan saat mengambil listing agen ini. Muat ulang beberapa saat lagi." className="py-8" />
            ) : listings.length === 0 ? (
              <EmptyState title="Belum ada listing aktif" message="Belum ada listing aktif dari agen ini." className="py-8" />
            ) : (
              <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
                {listings.map((p) => (
                  <li key={p.id} className="flex">
                    <div className="flex w-full flex-col [&>a]:h-full">
                      <PropertyCard listing={p} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={reviews.ok ? `Ulasan (${new Intl.NumberFormat("id-ID").format(reviews.summary.count)})` : "Ulasan"}>
            {!reviews.ok ? (
              <ErrorState title="Ulasan belum bisa dimuat" message="Terjadi gangguan saat mengambil ulasan agen ini. Muat ulang beberapa saat lagi." className="py-8" />
            ) : reviews.reviews.length === 0 ? (
              <EmptyState title="Belum ada ulasan" message="Belum ada ulasan untuk agen ini." className="py-8" />
            ) : (
              <>
                <ul className="flex flex-col gap-3">
                  {reviews.reviews.map((r) => (
                    <li key={r.id} className="rounded-md border border-ink-100 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-label-lg">{reviewerLabel(r.reviewer_name)}</span>
                        <RatingStars rating={r.rating} />
                      </div>
                      {r.comment ? <p className="mt-2 whitespace-pre-line break-words text-body-md text-ink-700">{r.comment}</p> : null}
                      <span className="mt-2 block text-caption">{formatDate(r.created_at)}</span>
                    </li>
                  ))}
                </ul>
                {reviews.summary.count > reviews.reviews.length ? (
                  <p className="mt-3 text-caption">Menampilkan {reviews.reviews.length} ulasan terbaru dari {new Intl.NumberFormat("id-ID").format(reviews.summary.count)} ulasan.</p>
                ) : null}
              </>
            )}
          </Section>
        </div>

        <aside aria-label="Hubungi agen" className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          <span className="text-label-md text-ink-500">Hubungi Agen</span>
          {wa ? (
            <>
              <p className="text-title-md break-all">{a.whatsapp_number}</p>
              <WhatsAppButton href={wa} className="w-full" />
              <span className="text-caption">Nomor WhatsApp agen selalu tampil agar Anda bisa menghubungi langsung.</span>
            </>
          ) : (
            <p className="text-body-md text-ink-500">Nomor WhatsApp agen belum tersedia.</p>
          )}
          {a.license_number ? (
            <div className="flex justify-between gap-3 border-t border-ink-100 pt-3.5">
              <span className="text-caption">No. Lisensi</span>
              <span className="text-body-md font-bold">{a.license_number}</span>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
