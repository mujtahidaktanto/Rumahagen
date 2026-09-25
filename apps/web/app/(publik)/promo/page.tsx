// app/(publik)/promo/page.tsx — Promo & Pengumuman publik (M11 Promo): kartu promo aktif (kampanye, sisa waktu, judul, ringkasan). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses.
// Hanya promo aktif dalam jendela jadwalnya yang terlihat (RLS); tidak ada halaman untuk promo yang belum mulai/sudah berakhir.
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { TagIcon } from "@/components/ui/icons";
import { expiryLabel, getActivePromos, safeHref } from "@/lib/public/promo-data";
import { excerptOf } from "@/lib/public/rich-text";

export const metadata: Metadata = {
  title: "Promo & Pengumuman | RumahAgen",
  description: "Penawaran spesial, event terbatas, dan pengumuman penting dari RumahAgen dan mitra developer.",
  alternates: { canonical: "/promo" },
};

export default async function PromoListPage() {
  const res = await getActivePromos();
  return (
    <div>
      <div className="bg-linear-to-b from-blue-50 to-white py-10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-3 px-4 sm:px-6 xl:px-10">
          <Badge tone="warning">Penawaran Terbatas</Badge>
          <h1 className="text-display">Promo &amp; Pengumuman</h1>
          <p className="max-w-140 text-body-lg text-ink-500">Penawaran spesial, event terbatas, dan pengumuman penting dari RumahAgen dan mitra developer.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-6 xl:px-10">
        {!res.ok ? (
          <div>
            <ErrorState title="Gagal memuat promo" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
            <div className="flex justify-center">
              <LinkButton href={"/promo" as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </div>
        ) : res.items.length === 0 ? (
          <EmptyState title="Belum ada promo aktif saat ini" message="Pantau terus halaman ini untuk penawaran terbaru." />
        ) : (
          <ul className="grid grid-cols-1 gap-5 pt-2 min-[560px]:grid-cols-2 lg:grid-cols-3">
            {res.items.map((p) => {
              const img = safeHref(p.image_reference);
              return (
                <li key={p.id} className="flex">
                  <Link
                    href={`/promo/${p.id}` as Route}
                    className="flex w-full min-w-0 flex-col overflow-hidden rounded-md border border-ink-100 bg-white text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
                  >
                    <div className="relative flex h-32 flex-none items-center justify-center bg-linear-to-br from-gold-500 to-gold-700 text-white">
                      {img ? (
                        // Banner dari data (jalur situs atau https); gambar biasa tanpa optimasi Next.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <TagIcon size={36} className="opacity-70" />
                      )}
                      {p.campaign_reference ? (
                        <span className="absolute top-3 left-3 max-w-[70%] truncate rounded-pill bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gold-700">{p.campaign_reference}</span>
                      ) : null}
                      <span className="absolute right-3 bottom-3 rounded-pill bg-ink-900/70 px-2.5 py-1 text-[11px] font-bold text-white">{expiryLabel(p.expires_at)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-4">
                      <span className="line-clamp-2 min-h-11 text-title-md text-ink-900">{p.title}</span>
                      <span className="line-clamp-2 min-h-10 text-body-md text-ink-500">{excerptOf(p.content)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
