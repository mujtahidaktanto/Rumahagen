// app/(publik)/developer/[slug]/page.tsx — Profil Publik Developer (M06, migration 0172). Empat keadaan: memuat (loading.tsx), tidak ditemukan (not-found.tsx:
// slug salah, atau developer tidak aktif), gagal (ErrorState di sini), sukses (DeveloperDetailView). Pola sama seperti app/(publik)/organisasi/[slug]/page.tsx.
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { DeveloperDetailView } from "@/components/public/DeveloperDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getDeveloperBySlug } from "@/lib/public/developer-data";
import { safeHref } from "@/lib/public/promo-data";
import { excerptOf } from "@/lib/public/rich-text";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getDeveloperBySlug(slug);
  if (res.state !== "ok") return { title: "Developer | RumahAgen", robots: { index: false, follow: false } };
  const d = res.developer;
  const title = `${d.company_name} — Developer Partner | RumahAgen`;
  const description = excerptOf(d.description, 155) || `Profil ${d.company_name} di RumahAgen: riwayat perumahan dan proyek aktif.`;
  const logo = safeHref(d.company_logo);
  return { title, description, alternates: { canonical: `/developer/${d.slug}` }, openGraph: { title, description, type: "website", images: logo ? [{ url: logo }] : undefined } };
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getDeveloperBySlug(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Developer gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/developer/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <DeveloperDetailView developer={res.developer} history={res.history} historyOk={res.historyOk} projects={res.projects} projectsOk={res.projectsOk} />;
}
