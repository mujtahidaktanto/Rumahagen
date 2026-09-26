// app/(publik)/promo/[id]/page.tsx — Detail Promo publik (M11 Promo-Detail): kampanye, judul, masa berlaku, isi, dan kartu "Ambil Penawaran Ini" (berlaku dari/berakhir + tombol ajakan bila tautannya aman).
// {id} = uuid promo (promo tidak punya slug). Promo yang belum mulai/berakhir/diarsipkan tidak terlihat pengunjung (RLS) -> "Promo tidak ditemukan".
// Tombol ajakan dan "Proyek terkait promo ini" berasal dari cta_reference terstruktur (lib/public/cta.ts): project:{slug}, course:{id}, event:{id}, page:{kunci}, whatsapp:{nomor}, url:https://...;
// target proyek/kursus/event hanya tampil bila terlihat publik.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/public/RichText";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BookIcon, BuildingIcon, CalendarIcon, ChevronRightIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { resolveCta } from "@/lib/public/cta";
import { excerptOf } from "@/lib/public/rich-text";
import { getPromo, safeHref, validityText } from "@/lib/public/promo-data";

type Props = { params: Promise<{ id: string }> };

const RELATED_HEADING = { project: "Proyek terkait promo ini", course: "Kursus terkait promo ini", event: "Event terkait promo ini" } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getPromo(id);
  if (res.state !== "ok") return { title: "Promo | RumahAgen", robots: { index: false, follow: false } };
  const p = res.promo;
  return {
    title: `${p.title} | Promo RumahAgen`,
    description: excerptOf(p.content, 155) || "Promo dan pengumuman dari RumahAgen.",
    alternates: { canonical: `/promo/${p.id}` },
  };
}

export default async function PromoDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getPromo(id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Promo gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/promo/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const p = res.promo;
  const cta = await resolveCta(p.cta_reference);
  const img = safeHref(p.image_reference);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/promo" as Route} className="text-ink-500">
          Promo
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {p.title}
        </span>
      </nav>

      {img ? (
        // Banner dari data (jalur situs atau https); gambar biasa tanpa optimasi Next.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" className="mt-4 h-48 w-full rounded-lg object-cover sm:h-64" />
      ) : (
        <div className="mt-4 h-32 rounded-lg bg-linear-to-br from-gold-500 to-gold-700 sm:h-44" aria-hidden="true" />
      )}

      <div className="grid items-start gap-8 pt-6 pb-14 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          {p.campaign_reference ? (
            <Badge tone="warning" className="mb-2.5">
              {p.campaign_reference}
            </Badge>
          ) : null}
          <h1 className="text-headline break-words">{p.title}</h1>
          <p className="mt-2.5 flex items-center gap-1.5 text-body-md text-ink-500">
            <CalendarIcon size={15} className="flex-none" />
            <span>Berlaku {validityText(p)}</span>
          </p>
          <div className="mt-6">
            <RichText text={p.content} empty="Detail promo belum ditambahkan." />
          </div>
          {cta?.related ? (
            <section className="mt-8">
              <h2 className="mb-3 text-title-lg">{RELATED_HEADING[cta.related.kind]}</h2>
              <Link href={cta.href as Route} className="flex items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                  {cta.related.kind === "project" ? <BuildingIcon size={18} /> : cta.related.kind === "course" ? <BookIcon size={18} /> : <CalendarIcon size={18} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-label-lg text-ink-900">{cta.related.title}</span>
                <ChevronRightIcon size={14} className="flex-none text-ink-500" />
              </Link>
            </section>
          ) : null}
        </article>

        <aside aria-label="Ambil penawaran" className="flex flex-col gap-4 rounded-lg border border-gold-200 bg-white p-5 shadow-2 lg:sticky lg:top-24">
          <span className="text-label-md text-gold-700">Ambil Penawaran Ini</span>
          <dl className="flex flex-col gap-2">
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Berlaku Dari</dt>
              <dd className="text-body-md font-bold">{formatDate(p.schedule_at) || "Sekarang"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-caption">Berakhir</dt>
              <dd className="text-body-md font-bold">{formatDate(p.expires_at) || "Tanpa batas"}</dd>
            </div>
          </dl>
          {cta ? (
            <LinkButton href={cta.href as Route} className="w-full" {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {cta.label}
            </LinkButton>
          ) : (
            <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Hubungi agen atau tim RumahAgen untuk mengambil penawaran ini.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
