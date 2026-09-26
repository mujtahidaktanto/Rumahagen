// app/(publik)/listing/[slug]/page.tsx — Detail Listing publik (M11 Detail-Listing). Empat keadaan: memuat (loading.tsx), tidak ditemukan (not-found.tsx), gagal (ErrorState di sini),
// sukses (ListingDetailView). Pengunjung hanya melihat listing published (RLS); pemilik/staf yang membuka listing berstatus lain melihat spanduk "tidak tersedia".
// Listing non-published tidak diindeks.
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { ListingDetailView } from "@/components/public/ListingDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { formatListingPrice } from "@/lib/format";
import { getListingDetail } from "@/lib/public/listing-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getListingDetail(slug);
  if (res.state !== "ok") return { title: "Listing | RumahAgen", robots: { index: false, follow: false } };
  const l = res.listing;
  const title = l.meta_title || `${l.title} | RumahAgen`;
  const description = l.meta_description || `${l.title} — ${formatListingPrice(l.price, l.price_unit)}${l.cityName ? `, ${l.cityName}` : ""}. Lihat foto, spesifikasi, dan hubungi agen.`;
  return {
    title,
    description,
    alternates: { canonical: `/listing/${l.slug}` },
    robots: l.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title, description, type: "website", images: l.photos[0] ? [{ url: l.photos[0].url }] : undefined },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getListingDetail(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Listing gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/listing/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <ListingDetailView listing={res.listing} agent={res.agent} agentRating={res.agentRating} similar={res.similar} />;
}
