// app/(publik)/project/[slug]/page.tsx — Detail Proyek Developer publik (M11 Detail-Developer-Project; URL kanonik /project/{slug} sesuai sitemap). Empat keadaan: memuat (loading.tsx), tidak ditemukan
// (not-found.tsx: slug salah atau proyek inactive/developer nonaktif — RLS), gagal (ErrorState di sini), sukses. Komisi hanya dibaca untuk Agent yang login.
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView, type Viewer } from "@/components/public/ProjectDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getSessionUser } from "@/lib/auth/session";
import { formatPriceRange } from "@/lib/format";
import { excerptOf } from "@/lib/public/rich-text";
import { getProjectDetail, getProjectPartnership, type Partnership } from "@/lib/public/project-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProjectDetail(slug);
  if (res.state !== "ok") return { title: "Proyek | RumahAgen", robots: { index: false, follow: false } };
  const p = res.project;
  const title = p.meta_title || `${p.name}${p.cityName ? ` — ${p.cityName}` : ""} | RumahAgen`;
  const description = p.meta_description || `${p.name}: ${formatPriceRange(p.price_min, p.price_max, p.price_unit)}. Lihat spesifikasi, legalitas, dan hubungi developer.`;
  return {
    title,
    description: excerptOf(description, 160),
    alternates: { canonical: `/project/${p.slug}` },
    openGraph: { title, description: excerptOf(description, 160), type: "website", images: p.photos[0] ? [{ url: p.photos[0].url }] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getProjectDetail(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Proyek gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/project/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  const user = await getSessionUser();
  const active = !!user && user.status === "active";
  const viewer: Viewer = !user ? "guest" : active && user.role === "agent" ? "agent" : "other";
  const partnership: Partnership | null = viewer === "agent" ? await getProjectPartnership(res.project.id, user!.id) : null;

  return <ProjectDetailView project={res.project} viewer={viewer} partnership={partnership} />;
}
