// app/(publik)/konten/[slug]/page.tsx — Detail Konten Publik (M11 Konten-Publik-Detail): judul, "Terakhir diperbarui", isi, dan kartu "Artikel Lainnya". Artikel yang tidak terbit menjawab
// "Halaman tidak ditemukan". Metadata memakai meta_title/meta_description/canonical_url bila diisi; indexability = noindex -> robots noindex.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/public/RichText";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { ChevronRightIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { getArticle } from "@/lib/public/content-data";
import { excerptOf } from "@/lib/public/rich-text";
import { safeHref } from "@/lib/public/promo-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getArticle(slug);
  if (res.state !== "ok") return { title: "Konten | RumahAgen", robots: { index: false, follow: false } };
  const a = res.article;
  return {
    title: a.meta_title || `${a.title} | RumahAgen`,
    description: a.meta_description || excerptOf(a.content, 155) || undefined,
    alternates: { canonical: safeHref(a.canonical_url) ?? `/konten/${a.slug}` },
    robots: a.indexability === "noindex" ? { index: false, follow: true } : undefined,
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getArticle(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Halaman gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/konten/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const { article: a, related } = res;
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/konten" as Route} className="text-ink-500">
          Konten Publik
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {a.title}
        </span>
      </nav>

      <div className="grid items-start gap-10 pt-6 pb-14 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0 max-w-3xl">
          <h1 className="mb-2.5 text-headline break-words">{a.title}</h1>
          <span className="text-caption">Terakhir diperbarui {formatDate(a.updated_at)}</span>
          <div className="mt-6">
            <RichText text={a.content} empty="Isi halaman ini belum ditambahkan." />
          </div>
        </article>

        {related.length > 0 ? (
          <aside aria-label="Artikel lainnya" className="flex flex-col gap-1 rounded-lg border border-ink-100 bg-white p-5 lg:sticky lg:top-24">
            <span className="mb-1 text-label-lg text-ink-500">Artikel Lainnya</span>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/konten/${r.slug}` as Route}
                className="flex min-h-11 items-center justify-between gap-2 border-b border-ink-50 py-2 text-body-md text-ink-700 no-underline last:border-b-0 hover:text-blue-600 hover:no-underline"
              >
                <span className="min-w-0">{r.title}</span>
                <ChevronRightIcon size={13} className="flex-none" />
              </Link>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
