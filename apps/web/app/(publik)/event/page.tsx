// app/(publik)/event/page.tsx — Daftar Event publik (M11 Discovery, tab Event): tab Akan Datang / Sudah Berlalu, filter kategori (CHECK events.category), cari judul/penyelenggara/lokasi, "Muat Lebih Banyak".
// Hanya event published dan public (RLS). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Halaman berfilter tidak diindeks.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { DiscoveryTabs } from "@/components/public/DiscoveryTabs";
import { EventCard } from "@/components/public/EventCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL, EVENT_MAX_SHOWN, EVENT_PAGE_SIZE, eventQuery, parseEventSearch, searchEvents } from "@/lib/public/event-data";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseEventSearch(await searchParams);
  const filtered = s.q !== "" || s.kategori !== null || s.waktu !== "akan_datang" || s.tampil !== EVENT_PAGE_SIZE;
  return {
    title: "Event Properti — Training, Open House, dan Gathering | RumahAgen",
    description: "Ikuti training, launching proyek, open house, dan gathering agen properti dari RumahAgen dan mitra.",
    alternates: { canonical: "/event" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

function Pills({ label, items, current, hrefFor }: { label: string; items: { value: string | null; text: string }[]; current: string | null; hrefFor: (v: string | null) => string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.value ?? "semua"}
          href={hrefFor(it.value) as Route}
          aria-current={current === it.value ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
            current === it.value ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
          )}
        >
          {it.text}
        </Link>
      ))}
    </nav>
  );
}

export default async function EventDiscoveryPage({ searchParams }: Props) {
  const search = parseEventSearch(await searchParams);
  const result = await searchEvents(search);
  const hasCriteria = search.q !== "" || search.kategori !== null;

  return (
    <div>
      <form action="/event" method="get">
        {search.kategori ? <input type="hidden" name="kategori" value={search.kategori} /> : null}
        {search.waktu !== "akan_datang" ? <input type="hidden" name="waktu" value={search.waktu} /> : null}
        <div className="border-b border-ink-100 bg-white py-5">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
            <DiscoveryTabs active="event" />
            <div role="search" className="flex flex-col gap-2.5 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Cari event</span>
                <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search.q}
                  maxLength={100}
                  placeholder="Cari judul event, penyelenggara, atau lokasi…"
                  className="h-11 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
                />
              </label>
              <Button type="submit">Cari</Button>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-surface">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-6 xl:px-10">
          <div className="mb-5 flex flex-col gap-3">
            <Pills
              label="Waktu"
              current={search.waktu}
              items={[
                { value: "akan_datang", text: "Akan Datang" },
                { value: "lalu", text: "Sudah Berlalu" },
              ]}
              hrefFor={(v) => `/event${eventQuery(search, { waktu: v === "lalu" ? "lalu" : "akan_datang", tampil: EVENT_PAGE_SIZE })}`}
            />
            <Pills
              label="Kategori"
              current={search.kategori}
              items={[{ value: null, text: "Semua kategori" }, ...EVENT_CATEGORIES.map((c) => ({ value: c as string, text: EVENT_CATEGORY_LABEL[c]! }))]}
              hrefFor={(v) => `/event${eventQuery(search, { kategori: v as typeof search.kategori, tampil: EVENT_PAGE_SIZE })}`}
            />
          </div>

          <p className="mb-4 text-body-md text-ink-500" aria-live="polite">
            {result.ok ? (
              <>
                <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> event ditemukan
              </>
            ) : null}
          </p>

          {!result.ok ? (
            <div className="rounded-md bg-white">
              <ErrorState title="Gagal memuat daftar event" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
              <div className="flex justify-center pb-10">
                <LinkButton href={`/event${eventQuery(search)}` as Route} variant="secondary" size="sm">
                  Coba Lagi
                </LinkButton>
              </div>
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-md bg-white">
              <EmptyState
                title={hasCriteria ? "Tidak ada event yang cocok" : search.waktu === "lalu" ? "Belum ada event yang sudah berlalu" : "Belum ada event mendatang"}
                message={hasCriteria ? "Coba kata kunci atau kategori lain." : "Event yang dipublikasikan akan tampil di sini."}
              />
              {hasCriteria ? (
                <div className="flex justify-center pb-10">
                  <LinkButton href={`/event${eventQuery({ q: "", kategori: null, waktu: search.waktu, tampil: EVENT_PAGE_SIZE })}` as Route} variant="secondary" size="sm">
                    Reset Filter
                  </LinkButton>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {result.items.map((e) => (
                  <li key={e.id}>
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2.5 pt-7">
                <span className="text-caption">
                  Menampilkan {result.items.length} dari {result.total} event
                </span>
                {result.items.length < result.total && search.tampil < EVENT_MAX_SHOWN ? (
                  <LinkButton href={`/event${eventQuery(search, { tampil: search.tampil + EVENT_PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
                    Muat Lebih Banyak
                  </LinkButton>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
