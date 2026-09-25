// app/(publik)/organisasi/[slug]/page.tsx — Detail Organisasi publik (M11 Detail-Organisasi). Empat keadaan: memuat (loading.tsx), tidak ditemukan (not-found.tsx: slug salah, atau organisasi tidak
// aktif — ditutup bertahap/ditutup/dibekukan tidak terlihat publik oleh RLS), gagal (ErrorState di sini), sukses (OrganizationDetailView).
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { OrganizationDetailView } from "@/components/public/OrganizationDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getOrganizationBySlug, ORG_TYPE_LABEL } from "@/lib/public/organization-data";
import { safeHref } from "@/lib/public/promo-data";
import { excerptOf } from "@/lib/public/rich-text";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getOrganizationBySlug(slug);
  if (res.state !== "ok") return { title: "Organisasi | RumahAgen", robots: { index: false, follow: false } };
  const o = res.org;
  const title = `${o.organization_name} — ${ORG_TYPE_LABEL[o.organization_type] ?? "Organisasi"} Properti | RumahAgen`;
  const description = excerptOf(o.description, 155) || `Profil ${o.organization_name} di RumahAgen: anggota tim dan listing.`;
  const logo = safeHref(o.logo_url);
  return { title, description, alternates: { canonical: `/organisasi/${o.slug}` }, openGraph: { title, description, type: "website", images: logo ? [{ url: logo }] : undefined } };
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getOrganizationBySlug(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Organisasi gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/organisasi/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <OrganizationDetailView org={res.org} members={res.members} membersOk={res.membersOk} listings={res.listings} listingsOk={res.listingsOk} />;
}
