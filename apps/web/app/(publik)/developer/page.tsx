// app/(publik)/developer/page.tsx — Daftar proyek Developer publik (M11 Discovery, tab Developer): cari nama/lokasi, filter tipe properti dan status (Tersedia, Segera Hadir, Unit Habis),
// "Muat Lebih Banyak". Hanya proyek active/coming_soon/sold_out milik developer aktif (RLS). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Halaman berfilter tidak diindeks.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { DiscoveryTabs } from "@/components/public/DiscoveryTabs";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL } from "@/lib/public/listing-params";
import { PROJECT_MAX_SHOWN, PROJECT_PAGE_SIZE, PROJECT_STATUSES, PROJECT_STATUS_LABEL, parseProjectSearch, projectQuery, searchProjects } from "@/lib/public/project-data";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseProjectSearch(await searchParams);
  const filtered = s.q !== "" || s.jenis !== null || s.status !== null || s.tampil !== PROJECT_PAGE_SIZE;
  return {
    title: "Proyek Developer Properti | RumahAgen",
    description: "Jelajahi proyek perumahan, apartemen, dan properti baru dari developer mitra RumahAgen.",
    alternates: { canonical: "/developer" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

function Chips({ label, items, current, hrefFor }: { label: string; items: { value: string | null; text: string }[]; current: string | null; hrefFor: (v: string | null) => string }) {
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

export default async function DeveloperDiscoveryPage({ searchParams }: Props) {
  const search = parseProjectSearch(await searchParams);
  const result = await searchProjects(search);
  const hasCriteria = search.q !== "" || search.jenis !== null || search.status !== null;

  return (
    <div>
      <form action="/developer" method="get">
        {search.jenis ? <input type="hidden" name="jenis" value={search.jenis} /> : null}
        {search.status ? <input type="hidden" name="status" value={search.status} /> : null}
        <div className="border-b border-ink-100 bg-white py-5">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
            <DiscoveryTabs active="developer" />
            <div role="search" className="flex flex-col gap-2.5 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Cari proyek</span>
                <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search.q}
                  maxLength={100}
                  placeholder="Cari nama proyek atau lokasi…"
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
            <Chips
              label="Status proyek"
              current={search.status}
              items={[{ value: null, text: "Semua status" }, ...PROJECT_STATUSES.map((s) => ({ value: s as string, text: PROJECT_STATUS_LABEL[s]! }))]}
              hrefFor={(v) => `/developer${projectQuery(search, { status: v as typeof search.status, tampil: PROJECT_PAGE_SIZE })}`}
            />
            <Chips
              label="Tipe properti"
              current={search.jenis}
              items={[{ value: null, text: "Semua tipe" }, ...PROPERTY_TYPES.map((t) => ({ value: t as string, text: PROPERTY_TYPE_LABEL[t] }))]}
              hrefFor={(v) => `/developer${projectQuery(search, { jenis: v as typeof search.jenis, tampil: PROJECT_PAGE_SIZE })}`}
            />
          </div>

          <p className="mb-4 text-body-md text-ink-500" aria-live="polite">
            {result.ok ? (
              <>
                <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> proyek ditemukan
              </>
            ) : null}
          </p>

          {!result.ok ? (
            <div className="rounded-md bg-white">
              <ErrorState title="Gagal memuat daftar proyek" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
              <div className="flex justify-center pb-10">
                <LinkButton href={`/developer${projectQuery(search)}` as Route} variant="secondary" size="sm">
                  Coba Lagi
                </LinkButton>
              </div>
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-md bg-white">
              <EmptyState
                title={hasCriteria ? "Tidak ada proyek yang cocok" : "Belum ada proyek"}
                message={hasCriteria ? "Coba longgarkan filter atau ganti kata kunci." : "Proyek developer mitra akan tampil di sini."}
              />
              {hasCriteria ? (
                <div className="flex justify-center pb-10">
                  <LinkButton href={"/developer" as Route} variant="secondary" size="sm">
                    Reset Filter
                  </LinkButton>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((p) => (
                  <li key={p.id}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2.5 pt-7">
                <span className="text-caption">
                  Menampilkan {result.items.length} dari {result.total} proyek
                </span>
                {result.items.length < result.total && search.tampil < PROJECT_MAX_SHOWN ? (
                  <LinkButton href={`/developer${projectQuery(search, { tampil: search.tampil + PROJECT_PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
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
