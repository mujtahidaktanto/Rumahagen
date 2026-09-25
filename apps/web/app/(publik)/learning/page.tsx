// app/(publik)/learning/page.tsx — Daftar Course publik (M11 Learning): pencarian, filter kategori (CHECK courses.category), kartu course published, "Muat Lebih Banyak" (?tampil=).
// Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Halaman berfilter tidak diindeks.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/public/LearningCards";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, COURSE_MAX_SHOWN, COURSE_PAGE_SIZE, courseQuery, parseCourseSearch, searchCourses } from "@/lib/public/learning-data";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseCourseSearch(await searchParams);
  const filtered = s.q !== "" || s.kategori !== null || s.tampil !== COURSE_PAGE_SIZE;
  return {
    title: "Learning — Course untuk Agen Properti | RumahAgen",
    description: "Tingkatkan kompetensi Anda lewat course sales, legal, produk developer, dan KPR dari RumahAgen.",
    alternates: { canonical: "/learning" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function LearningListPage({ searchParams }: Props) {
  const search = parseCourseSearch(await searchParams);
  const result = await searchCourses(search);

  return (
    <div>
      <form action="/learning" method="get" role="search" className="bg-linear-to-b from-blue-50 to-white py-10">
        {search.kategori ? <input type="hidden" name="kategori" value={search.kategori} /> : null}
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-4 px-4 sm:px-6 xl:px-10">
          <h1 className="text-display">Learning</h1>
          <p className="max-w-140 text-body-lg text-ink-500">Tingkatkan kompetensi Anda lewat course sales, legal, produk developer, dan KPR.</p>
          <div className="flex w-full max-w-xl flex-col gap-2.5 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Cari course</span>
              <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
              <input
                type="search"
                name="q"
                defaultValue={search.q}
                maxLength={100}
                placeholder="Cari course…"
                className="h-11 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
              />
            </label>
            <Button type="submit">Cari</Button>
          </div>
        </div>
      </form>

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-6 xl:px-10">
        <nav aria-label="Kategori" className="mb-5 flex flex-wrap gap-2">
          {[null, ...COURSE_CATEGORIES].map((k) => (
            <Link
              key={k ?? "semua"}
              href={`/learning${courseQuery(search, { kategori: k, tampil: COURSE_PAGE_SIZE })}` as Route}
              aria-current={search.kategori === k ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
                search.kategori === k ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
              )}
            >
              {k ? COURSE_CATEGORY_LABEL[k] : "Semua"}
            </Link>
          ))}
        </nav>

        <p className="mb-4 text-body-md text-ink-500" aria-live="polite">
          {result.ok ? (
            <>
              <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> course ditemukan
            </>
          ) : null}
        </p>

        {!result.ok ? (
          <div>
            <ErrorState title="Gagal memuat course" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
            <div className="flex justify-center">
              <LinkButton href={`/learning${courseQuery(search)}` as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </div>
        ) : result.items.length === 0 ? (
          <div>
            <EmptyState
              title={search.q || search.kategori ? "Tidak ada course yang cocok" : "Belum ada course"}
              message={search.q || search.kategori ? "Coba kata kunci atau kategori lain." : "Course yang sudah terbit akan tampil di sini."}
            />
            {search.q || search.kategori ? (
              <div className="flex justify-center">
                <LinkButton href={"/learning" as Route} variant="secondary" size="sm">
                  Reset Pencarian
                </LinkButton>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 lg:grid-cols-3">
              {result.items.map((c) => (
                <li key={c.id}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-center gap-2.5 pt-7">
              <span className="text-caption">
                Menampilkan {result.items.length} dari {result.total} course
              </span>
              {result.items.length < result.total && search.tampil < COURSE_MAX_SHOWN ? (
                <LinkButton href={`/learning${courseQuery(search, { tampil: search.tampil + COURSE_PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
                  Muat Lebih Banyak
                </LinkButton>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
