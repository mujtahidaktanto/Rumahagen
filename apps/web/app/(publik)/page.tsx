// app/(publik)/page.tsx — Homepage publik (M11 Homepage): Hero + pencarian, Jelajahi RumahAgen, Properti Pilihan, Pengumuman & Promo, Tingkatkan Kompetensi.
// Data dibaca di server (RLS anon): tiap bagian punya keadaan kosong dan gagal sendiri sehingga satu bagian yang gagal tidak menjatuhkan halaman.
import type { Metadata, Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroSearch } from "@/components/public/HeroSearch";
import { PropertyCard } from "@/components/public/PropertyCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { BookIcon, BuildingIcon, CalendarIcon, ChevronRightIcon, ClockIcon, DocIcon, OfficeIcon, TagIcon, UserIcon, UsersIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { getAnnouncements, getFeaturedCourses, getFeaturedListings } from "@/lib/public/home-data";

export const metadata: Metadata = {
  title: "RumahAgen — Temukan Properti, Temukan Peluang",
  description: "Platform properti yang menghubungkan pembeli, agen, developer, dan peluang belajar dalam satu ekosistem.",
};

const r = (p: string) => p as Route;

const EXPLORE = [
  { href: "/listing", label: "Listing", icon: <OfficeIcon size={20} /> },
  { href: "/agen", label: "Agen", icon: <UserIcon size={20} /> },
  { href: "/organisasi", label: "Organisasi", icon: <UsersIcon size={20} /> },
  { href: "/developer", label: "Developer", icon: <BuildingIcon size={20} /> },
  { href: "/event", label: "Event", icon: <CalendarIcon size={20} /> },
  { href: "/learning", label: "Learning", icon: <BookIcon size={20} /> },
  { href: "/learning-session", label: "Learning Session", icon: <ClockIcon size={20} /> },
  { href: "/konten", label: "Konten Publik", icon: <DocIcon size={20} /> },
  { href: "/promo", label: "Promo", icon: <TagIcon size={20} /> },
];

const POPULAR = ["Rumah", "Apartemen", "Tanah", "Ruko", "Bogor", "Jakarta"];

function Section({ title, subtitle, href, hrefLabel, children }: { title: string; subtitle?: string; href?: string; hrefLabel?: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pt-10 sm:px-6 xl:px-10 xl:pt-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-headline">{title}</h2>
          {subtitle ? <p className="text-body-md text-ink-500">{subtitle}</p> : null}
        </div>
        {href ? (
          <Link href={r(href)} className="flex-none text-label-lg">
            {hrefLabel} →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const [listings, announcements, courses] = await Promise.all([getFeaturedListings(4), getAnnouncements(3), getFeaturedCourses(2)]);

  return (
    <>
      <div className="bg-linear-to-b from-blue-50 to-white py-10 xl:py-14">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 xl:px-10">
          <div className="flex flex-col gap-5">
            <h1 className="text-display xl:text-[38px] xl:leading-[46px]">
              Temukan Properti, Temukan Peluang, Bersama <span className="text-blue-600">RumahAgen</span>
            </h1>
            <p className="max-w-115 text-body-lg text-ink-500">Platform properti yang menghubungkan pembeli, agen, developer, dan peluang belajar dalam satu ekosistem.</p>
            <HeroSearch />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-caption">Pencarian populer:</span>
              {POPULAR.map((t) => (
                <Link key={t} href={r(`/listing?q=${encodeURIComponent(t)}`)} className="inline-flex min-h-8 items-center text-caption">
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative hidden h-105 overflow-hidden rounded-lg bg-linear-to-br from-blue-700 to-blue-500 lg:block" aria-hidden="true">
            <div className="absolute bottom-7 left-7 max-w-80 text-white">
              <div className="text-title-lg">Rumah untuk Masa Depan yang Lebih Baik</div>
              <div className="text-body-md text-white/85">Bersama ribuan agen profesional di seluruh Indonesia</div>
            </div>
          </div>
        </div>
      </div>

      <Section title="Jelajahi RumahAgen" subtitle="Temukan berbagai layanan dan informasi yang Anda butuhkan.">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-9">
          {EXPLORE.map((e) => (
            <li key={e.href}>
              <Link
                href={r(e.href)}
                className="flex h-full flex-col items-center gap-2.5 rounded-md border border-ink-100 px-2 py-4 text-center text-ink-900 no-underline hover:border-blue-200 hover:bg-blue-50 hover:no-underline"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">{e.icon}</span>
                <span className="text-[13px] font-bold">{e.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Properti Pilihan" subtitle="Temukan properti menarik dari agen profesional." href="/listing" hrefLabel="Lihat semua listing">
        {!listings.ok ? (
          <ErrorState title="Properti belum bisa dimuat" message="Terjadi gangguan saat mengambil listing. Muat ulang halaman ini beberapa saat lagi." />
        ) : listings.items.length === 0 ? (
          <EmptyState title="Belum ada listing unggulan minggu ini" message="Listing yang sudah terbit akan tampil di sini." />
        ) : (
          <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-4">
            {listings.items.map((p) => (
              <li key={p.id} className="flex">
                <div className="flex w-full flex-col [&>a]:h-full">
                  <PropertyCard listing={p} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="mx-auto grid w-full max-w-[1280px] items-start gap-5 px-4 pt-10 sm:px-6 lg:grid-cols-2 xl:px-10 xl:pt-12">
        <section className="overflow-hidden rounded-md border border-ink-100">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <h2 className="text-title-lg">Pengumuman &amp; Promo</h2>
            <Link href={r("/promo")} className="text-label-lg">
              Lihat semua
            </Link>
          </div>
          {!announcements.ok ? (
            <ErrorState title="Pengumuman belum bisa dimuat" className="py-8" />
          ) : announcements.items.length === 0 ? (
            <EmptyState title="Belum ada pengumuman" className="py-8" />
          ) : (
            <ul>
              {announcements.items.map((a) => (
                <li key={a.id} className="border-b border-ink-50 last:border-b-0">
                  <Link href={r(`/promo/${a.id}`)} className="flex min-h-14 items-center gap-3 px-5 py-3.5 text-inherit no-underline hover:bg-ink-50 hover:no-underline">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-label-lg text-ink-900">{a.title}</div>
                      <div className="text-caption">{formatDate(a.schedule_at ?? a.created_at)}</div>
                    </div>
                    <ChevronRightIcon size={14} className="flex-none text-ink-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-md border border-ink-100">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <h2 className="text-title-lg">Tingkatkan Kompetensi Anda</h2>
            <Link href={r("/learning")} className="text-label-lg">
              Lihat semua
            </Link>
          </div>
          {!courses.ok ? (
            <ErrorState title="Kursus belum bisa dimuat" className="py-8" />
          ) : courses.items.length === 0 ? (
            <EmptyState title="Belum ada kursus" message="Kursus yang sudah terbit akan tampil di sini." className="py-8" />
          ) : (
            <ul>
              {courses.items.map((c) => (
                <li key={c.id} className="flex gap-3 border-b border-ink-50 px-5 py-3.5 last:border-b-0">
                  <div className="h-16 w-22 flex-none rounded-sm bg-ink-100" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="truncate text-label-lg text-ink-900">{c.title}</span>
                    <span className="flex gap-2.5 text-caption">
                      <span>{c.lessonCount} Materi</span>
                      <span className="truncate">{c.category}</span>
                    </span>
                    <LinkButton href={r(`/learning/${c.id}`)} size="sm" className="self-start">
                      Mulai Belajar
                    </LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
