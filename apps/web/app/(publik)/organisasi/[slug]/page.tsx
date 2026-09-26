// app/(publik)/organisasi/[slug]/page.tsx — Detail Organisasi publik (M11 Detail-Organisasi). Empat keadaan: memuat (loading.tsx), tidak ditemukan (not-found.tsx: slug salah, atau organisasi tidak
// aktif — ditutup bertahap/ditutup/dibekukan tidak terlihat publik oleh RLS), gagal (ErrorState di sini), sukses (OrganizationDetailView).
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizationDetailView } from "@/components/public/OrganizationDetailView";
import { EnrollButton } from "@/components/public/EnrollButton";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getMyJoinState } from "@/lib/agent/org-data";
import { getSessionUser } from "@/lib/auth/session";
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
  // Kartu "Bergabung": pengunjung diajak masuk; Agent aktif melihat keadaannya (anggota, diundang, sudah mengajukan, atau boleh mengajukan). Peran lain tidak melihat kartu.
  const user = await getSessionUser();
  const joinState = user && user.role === "agent" && user.status === "active" ? await getMyJoinState(res.org.id, user.id) : null;
  const card = "flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-2";
  const joinCard = !user ? (
    <div className={card}>
      <span className="text-label-md text-ink-500">Bergabung</span>
      <p className="text-body-md">Masuk sebagai Agent untuk mengajukan bergabung ke organisasi ini.</p>
      <LinkButton href={`/login?next=${encodeURIComponent(`/organisasi/${res.org.slug}`)}` as Route} variant="secondary">
        Masuk
      </LinkButton>
    </div>
  ) : joinState ? (
    <div className={card}>
      <span className="text-label-md text-ink-500">Bergabung</span>
      {joinState === "member" ? (
        <>
          <p className="text-body-md">Anda anggota organisasi ini.</p>
          <Link href={"/agent/organisasi" as Route} className="text-label-lg">
            Buka Organisasi Saya
          </Link>
        </>
      ) : joinState === "invited" ? (
        <>
          <p className="text-body-md">Leader mengundang Anda. Jawab undangannya di halaman Organisasi.</p>
          <LinkButton href={"/agent/organisasi" as Route}>Lihat Undangan</LinkButton>
        </>
      ) : joinState === "requested" ? (
        <p role="status" className="rounded-md bg-info-100 p-3 text-body-md">
          Permohonan Anda sudah terkirim dan menunggu tinjauan leader.
        </p>
      ) : (
        <>
          <p className="text-body-md">Ajukan diri untuk bergabung. Leader akan meninjau permohonan Anda.</p>
          <EnrollButton endpoint={`/organizations/${res.org.id}/join-requests`} label="Ajukan Bergabung" doneMessage="Permohonan terkirim. Leader akan meninjau dan Anda diberi tahu lewat notifikasi." />
        </>
      )}
    </div>
  ) : null;
  return <OrganizationDetailView org={res.org} members={res.members} membersOk={res.membersOk} listings={res.listings} listingsOk={res.listingsOk} joinCard={joinCard} />;
}
