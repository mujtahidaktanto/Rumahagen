// components/public/OrganizationDetailView.tsx — isi Detail Organisasi publik (M11 Detail-Organisasi): banner, kepala (logo, nama, jenis, alamat), Tentang, Anggota Tim, Listing dari Organisasi
// Ini, dan kartu Informasi Kontak (situs, telepon, alamat, media sosial). Kontak organisasi memang publik (keputusan 2026-09-25). Tautan hanya https; telepon dibuka lewat tel:.
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { AgentCard } from "@/components/public/AgentCard";
import { OrgLogo } from "@/components/public/OrganizationCard";
import { PropertyCard } from "@/components/public/PropertyCard";
import { RichText } from "@/components/public/RichText";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { MailIcon, PinIcon } from "@/components/ui/icons";
import type { PublicAgent } from "@/lib/public/agent-data";
import type { FeaturedListing } from "@/lib/public/home-data";
import { ORG_TYPE_LABEL, socialLinks, type PublicOrganization } from "@/lib/public/organization-data";
import { safeHref } from "@/lib/public/promo-data";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

const phoneIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export function OrganizationDetailView({
  org,
  members,
  membersOk,
  listings,
  listingsOk,
}: {
  org: PublicOrganization;
  members: PublicAgent[];
  membersOk: boolean;
  listings: FeaturedListing[];
  listingsOk: boolean;
}) {
  const banner = safeHref(org.banner_url);
  const website = safeHref(org.website);
  const phoneDigits = (org.contact_phone ?? "").replace(/[^\d+]/g, "");
  const socials = socialLinks(org.social_media);
  const hasContact = !!(website?.startsWith("https://") || org.contact_phone || org.address || socials.length);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/organisasi" as Route} className="text-ink-500">
          Organisasi
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {org.organization_name}
        </span>
      </nav>

      {banner ? (
        // Banner dari data (jalur situs atau https); gambar biasa tanpa optimasi Next.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner} alt="" className="mt-4 h-36 w-full rounded-lg object-cover sm:h-52" />
      ) : (
        <div className="mt-4 h-28 rounded-lg bg-linear-to-br from-blue-700 to-blue-500 sm:h-40" aria-hidden="true" />
      )}

      <div className="-mt-9 flex items-end gap-4 px-4 sm:px-6">
        <OrgLogo org={org} size={80} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-headline break-words">{org.organization_name}</h1>
            <Badge tone="info">{ORG_TYPE_LABEL[org.organization_type] ?? org.organization_type}</Badge>
          </div>
          {org.address ? <span className="text-body-md text-ink-500">{org.address}</span> : null}
        </div>
      </div>

      <div className="grid items-start gap-8 pt-8 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title="Tentang Organisasi">
            <RichText text={org.description} empty="Organisasi ini belum menambahkan deskripsi." />
          </Section>

          <Section title={`Anggota Tim (${members.length})`}>
            {!membersOk ? (
              <ErrorState title="Anggota belum bisa dimuat" message="Terjadi gangguan saat mengambil anggota tim. Muat ulang beberapa saat lagi." className="py-8" />
            ) : members.length === 0 ? (
              <EmptyState title="Belum ada anggota tim" message="Belum ada anggota tim aktif dengan profil publik." className="py-8" />
            ) : (
              <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
                {members.map((m) => (
                  <li key={m.user_id}>
                    <AgentCard agent={m} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Listing dari Organisasi Ini">
            {!listingsOk ? (
              <ErrorState title="Listing belum bisa dimuat" message="Terjadi gangguan saat mengambil listing. Muat ulang beberapa saat lagi." className="py-8" />
            ) : listings.length === 0 ? (
              <EmptyState title="Belum ada listing aktif" message="Belum ada listing aktif dari organisasi ini." className="py-8" />
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
        </div>

        <aside aria-label="Informasi kontak" className="flex flex-col gap-3.5 rounded-lg border border-ink-100 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          <span className="text-label-md text-ink-500">Informasi Kontak</span>
          {website?.startsWith("https://") ? (
            <a href={website} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2.5 break-all text-body-md">
              <MailIcon size={16} className="flex-none" />
              {website.replace(/^https:\/\//, "")}
            </a>
          ) : null}
          {org.contact_phone ? (
            <a href={`tel:${phoneDigits}`} className="flex min-h-11 items-center gap-2.5 text-body-md">
              <span className="flex-none">{phoneIcon}</span>
              {org.contact_phone}
            </a>
          ) : null}
          {org.address ? (
            <p className="flex items-start gap-2.5 text-body-md text-ink-700">
              <PinIcon size={16} className="mt-0.5 flex-none" />
              <span>{org.address}</span>
            </p>
          ) : null}
          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-2 border-t border-ink-100 pt-3.5">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-pill border-[1.5px] border-ink-100 px-3.5 text-[13px] font-bold text-ink-700 no-underline hover:border-blue-500 hover:no-underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {!hasContact ? <p className="text-body-md text-ink-500">Informasi kontak belum ditambahkan.</p> : null}
        </aside>
      </div>
    </div>
  );
}
