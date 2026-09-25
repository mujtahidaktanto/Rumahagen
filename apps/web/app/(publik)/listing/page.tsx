// app/(publik)/listing/page.tsx — Discovery Listing (M11 Discovery): pencarian + filter di URL (server-render, tanpa JS untuk memfilter), urutan, dan "Muat Lebih Banyak"
// (?tampil= bertambah 12). Empat keadaan: memuat (loading.tsx), kosong (belum ada listing / filter terlalu ketat), gagal, sukses. Halaman berfilter tidak diindeks mesin pencari.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { DiscoveryTabs } from "@/components/public/DiscoveryTabs";
import { FilterToggle } from "@/components/public/FilterToggle";
import { ListingFilters } from "@/components/public/ListingFilters";
import { PropertyCard } from "@/components/public/PropertyCard";
import { SortSelect } from "@/components/public/SortSelect";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PAGE_SIZE, activeFilterCount, listingQuery, parseListingSearch } from "@/lib/public/listing-params";
import { getAmenities, searchListings } from "@/lib/public/listing-search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseListingSearch(await searchParams);
  const filtered = s.q !== "" || activeFilterCount(s) > 0 || s.urut !== "terbaru" || s.tampil !== PAGE_SIZE;
  return {
    title: s.q ? `Cari “${s.q}” | Properti RumahAgen` : "Cari Properti | RumahAgen",
    description: "Cari rumah, apartemen, ruko, tanah, dan properti lain dari agen profesional di seluruh Indonesia.",
    alternates: { canonical: "/listing" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

const TRANSACTIONS = [
  { value: "sale", label: "Dijual" },
  { value: "rent", label: "Disewa" },
] as const;

export default async function ListingDiscoveryPage({ searchParams }: Props) {
  const search = parseListingSearch(await searchParams);
  const [result, amenities] = await Promise.all([searchListings(search), getAmenities()]);
  const filterCount = activeFilterCount(search);
  const hasCriteria = filterCount > 0 || search.q !== "";
  // Reset menghapus kata kunci dan semua filter tetapi tetap di jenis transaksi (Dijual/Disewa) yang sedang dilihat.
  const clearHref = `/listing${listingQuery(search, { q: "", jenis: [], min: null, max: null, kt: null, km: null, fasilitas: [], urut: "terbaru", tampil: PAGE_SIZE })}` as Route;

  return (
    <form action="/listing" method="get">
      <input type="hidden" name="urut" value={search.urut === "terbaru" ? "" : search.urut} />
      <input type="hidden" name="transaksi" value={search.transaksi === "sale" ? "" : search.transaksi} />

      <div className="border-b border-ink-100 bg-white py-5">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <DiscoveryTabs active="listing" />
          <div role="search" className="flex flex-col gap-2.5 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Kata kunci pencarian</span>
              <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
              <input
                type="search"
                name="q"
                defaultValue={search.q}
                maxLength={100}
                placeholder="Cari lokasi, nama proyek, atau kata kunci…"
                className="h-11 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
              />
            </label>
            <Button type="submit">Cari</Button>
          </div>
        </div>
      </div>

      <div className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1280px] items-start gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[264px_1fr] xl:px-10">
          <aside aria-label="Filter" className="lg:sticky lg:top-24">
            <FilterToggle count={filterCount}>
              <ListingFilters search={search} amenities={amenities} />
            </FilterToggle>
          </aside>

          <section aria-label="Hasil pencarian" className="min-w-0">
            <div role="group" aria-label="Jenis transaksi" className="mb-4 inline-flex rounded-pill border-[1.5px] border-ink-100 bg-white p-1">
              {TRANSACTIONS.map((t) => (
                <Link
                  key={t.value}
                  href={`/listing${listingQuery(search, { transaksi: t.value, tampil: PAGE_SIZE })}` as Route}
                  aria-current={search.transaksi === t.value ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 min-w-28 items-center justify-center rounded-pill px-5 text-[14px] font-bold no-underline hover:no-underline",
                    search.transaksi === t.value ? "bg-blue-600 text-white hover:text-white" : "text-ink-700 hover:bg-ink-50",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-body-md text-ink-500" aria-live="polite">
                {result.ok ? (
                  <>
                    <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> properti {search.transaksi === "sale" ? "dijual" : "disewakan"} ditemukan
                  </>
                ) : null}
              </p>
              <SortSelect value={search.urut} />
            </div>

            {!result.ok ? (
              <div className="rounded-md bg-white">
                <ErrorState title="Gagal memuat hasil pencarian" message="Terjadi gangguan saat mengambil listing. Coba lagi beberapa saat lagi." />
                <div className="flex justify-center pb-10">
                  <LinkButton href={`/listing${listingQuery(search)}` as Route} variant="secondary" size="sm">
                    Coba Lagi
                  </LinkButton>
                </div>
              </div>
            ) : result.items.length === 0 ? (
              <div className="rounded-md bg-white">
                {hasCriteria ? (
                  <EmptyState
                    title="Tidak ada properti yang cocok dengan filter Anda"
                    message="Coba longgarkan filter, misalnya perluas rentang harga atau kurangi jumlah kamar."
                  />
                ) : (
                  <EmptyState
                    title={search.transaksi === "sale" ? "Belum ada properti yang dijual" : "Belum ada properti yang disewakan"}
                    message="Listing yang sudah terbit akan tampil di sini."
                  />
                )}
                {hasCriteria ? (
                  <div className="flex justify-center pb-10">
                    <LinkButton href={clearHref} variant="secondary" size="sm">
                      Reset Filter
                    </LinkButton>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3">
                  {result.items.map((p) => (
                    <li key={p.id} className="flex">
                      <div className="flex w-full flex-col [&>a]:h-full">
                        <PropertyCard listing={p} />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col items-center gap-2.5 pt-7">
                  <span className="text-caption">
                    Menampilkan {result.items.length} dari {result.total} properti
                  </span>
                  {result.items.length < result.total && search.tampil < 96 ? (
                    <LinkButton href={`/listing${listingQuery(search, { tampil: search.tampil + PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
                      Muat Lebih Banyak
                    </LinkButton>
                  ) : null}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}
