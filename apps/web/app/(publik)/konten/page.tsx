// app/(publik)/konten/page.tsx — Pusat Bantuan & Informasi / Konten Publik (M11 Konten-Publik): kartu artikel published dengan pencarian topik (?q=). Empat keadaan: memuat (loading.tsx), kosong
// (belum ada artikel / tidak cocok), gagal, sukses. Halaman dengan pencarian tidak diindeks.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { DocIcon, SearchIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { listArticles } from "@/lib/public/content-data";
import { excerptOf } from "@/lib/public/rich-text";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const qOf = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").trim().slice(0, 100);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = qOf((await searchParams).q);
  return {
    title: "Pusat Bantuan & Informasi | RumahAgen",
    description: "Panduan, kebijakan, dan syarat penggunaan platform RumahAgen — semua dalam satu tempat.",
    alternates: { canonical: "/konten" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function ContentListPage({ searchParams }: Props) {
  const q = qOf((await searchParams).q);
  const res = await listArticles(q);

  return (
    <div>
      <form action="/konten" method="get" role="search" className="bg-linear-to-b from-blue-50 to-white py-10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-4 px-4 sm:px-6 xl:px-10">
          <h1 className="text-display">Pusat Bantuan &amp; Informasi</h1>
          <p className="max-w-140 text-body-lg text-ink-500">Panduan, kebijakan, dan syarat penggunaan platform RumahAgen — semua dalam satu tempat.</p>
          <div className="flex w-full max-w-xl flex-col gap-2.5 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Cari topik bantuan</span>
              <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                maxLength={100}
                placeholder="Cari topik bantuan…"
                className="h-11 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
              />
            </label>
            <Button type="submit">Cari</Button>
          </div>
        </div>
      </form>

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-6 xl:px-10">
        {!res.ok ? (
          <div>
            <ErrorState title="Gagal memuat konten" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
            <div className="flex justify-center">
              <LinkButton href={(q ? `/konten?q=${encodeURIComponent(q)}` : "/konten") as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </div>
        ) : res.items.length === 0 ? (
          <div>
            <EmptyState
              title={q ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
              message={q ? "Coba kata kunci lain, atau hubungi tim kami langsung." : "Artikel yang sudah dipublikasikan akan tampil di sini."}
            />
            {q ? (
              <div className="flex justify-center">
                <LinkButton href={"/konten" as Route} variant="secondary" size="sm">
                  Reset Pencarian
                </LinkButton>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 pt-2 min-[560px]:grid-cols-2 lg:grid-cols-3">
            {res.items.map((a) => (
              <li key={a.id} className="flex">
                <Link
                  href={`/konten/${a.slug}` as Route}
                  className="flex w-full min-w-0 flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                    <DocIcon size={18} />
                  </span>
                  <span className="line-clamp-2 min-h-11 text-title-md text-ink-900">{a.title}</span>
                  <span className="line-clamp-2 min-h-10 text-body-md text-ink-500">{excerptOf(a.content)}</span>
                  <span className="text-caption">Diperbarui {formatDate(a.updated_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
