// app/(publik)/organisasi/page.tsx — Daftar Organisasi publik (M11 Discovery, tab Organisasi): cari nama/alamat, filter jenis (CHECK organizations.organization_type), "Muat Lebih Banyak".
// Hanya organisasi aktif yang terlihat (RLS). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Halaman berfilter tidak diindeks.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { DiscoveryTabs } from "@/components/public/DiscoveryTabs";
import { OrganizationCard } from "@/components/public/OrganizationCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { ORG_MAX_SHOWN, ORG_PAGE_SIZE, ORG_TYPES, ORG_TYPE_LABEL, orgQuery, parseOrgSearch, searchOrganizations } from "@/lib/public/organization-data";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseOrgSearch(await searchParams);
  const filtered = s.q !== "" || s.jenis !== null || s.tampil !== ORG_PAGE_SIZE;
  return {
    title: "Cari Organisasi Properti | RumahAgen",
    description: "Temukan agency, kantor, tim, dan komunitas agen properti di RumahAgen.",
    alternates: { canonical: "/organisasi" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function OrganizationDiscoveryPage({ searchParams }: Props) {
  const search = parseOrgSearch(await searchParams);
  const result = await searchOrganizations(search);

  return (
    <div>
      <form action="/organisasi" method="get">
        {search.jenis ? <input type="hidden" name="jenis" value={search.jenis} /> : null}
        <div className="border-b border-ink-100 bg-white py-5">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
            <DiscoveryTabs active="organisasi" />
            <div role="search" className="flex flex-col gap-2.5 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Cari organisasi</span>
                <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search.q}
                  maxLength={100}
                  placeholder="Cari nama organisasi atau lokasi…"
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
          <nav aria-label="Jenis organisasi" className="mb-5 flex flex-wrap gap-2">
            {[null, ...ORG_TYPES].map((j) => (
              <Link
                key={j ?? "semua"}
                href={`/organisasi${orgQuery(search, { jenis: j, tampil: ORG_PAGE_SIZE })}` as Route}
                aria-current={search.jenis === j ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
                  search.jenis === j ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
                )}
              >
                {j ? ORG_TYPE_LABEL[j] : "Semua"}
              </Link>
            ))}
          </nav>

          <p className="mb-4 text-body-md text-ink-500" aria-live="polite">
            {result.ok ? (
              <>
                <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> organisasi ditemukan
              </>
            ) : null}
          </p>

          {!result.ok ? (
            <div className="rounded-md bg-white">
              <ErrorState title="Gagal memuat daftar organisasi" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
              <div className="flex justify-center pb-10">
                <LinkButton href={`/organisasi${orgQuery(search)}` as Route} variant="secondary" size="sm">
                  Coba Lagi
                </LinkButton>
              </div>
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-md bg-white">
              <EmptyState
                title={search.q || search.jenis ? "Tidak ada organisasi yang cocok" : "Belum ada organisasi"}
                message={search.q || search.jenis ? "Coba kata kunci atau jenis lain." : "Organisasi aktif akan tampil di sini."}
              />
              {search.q || search.jenis ? (
                <div className="flex justify-center pb-10">
                  <LinkButton href={"/organisasi" as Route} variant="secondary" size="sm">
                    Reset Pencarian
                  </LinkButton>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((o) => (
                  <li key={o.id}>
                    <OrganizationCard org={o} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2.5 pt-7">
                <span className="text-caption">
                  Menampilkan {result.items.length} dari {result.total} organisasi
                </span>
                {result.items.length < result.total && search.tampil < ORG_MAX_SHOWN ? (
                  <LinkButton href={`/organisasi${orgQuery(search, { tampil: search.tampil + ORG_PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
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
