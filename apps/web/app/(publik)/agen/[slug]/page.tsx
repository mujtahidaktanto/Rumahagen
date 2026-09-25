// app/(publik)/agen/[slug]/page.tsx — Detail Agen publik (M11 Detail-Agen). {slug} = agent_profiles.public_slug (nama + 8 karakter user_id). Empat keadaan: memuat (loading.tsx),
// tidak ditemukan/tidak publik (not-found.tsx), gagal (ErrorState di sini), sukses (AgentDetailView). Profil privat tidak dibedakan dari tidak ada (view public_agent_profiles).
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { AgentDetailView } from "@/components/public/AgentDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getAgentBySlug } from "@/lib/public/agent-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getAgentBySlug(slug);
  if (res.state !== "ok") return { title: "Agen | RumahAgen", robots: { index: false, follow: false } };
  const a = res.agent;
  const place = [a.city_name, a.province_name].filter(Boolean).join(", ");
  const title = `${a.full_name} — Agen Properti${place ? ` di ${place}` : ""} | RumahAgen`;
  const description = a.bio ? a.bio.slice(0, 155) : `Profil agen properti ${a.full_name} di RumahAgen: ${a.active_listings_count} listing aktif.`;
  return {
    title,
    description,
    alternates: { canonical: `/agen/${a.public_slug}` },
    openGraph: { title, description, type: "profile", images: a.avatar_url ? [{ url: a.avatar_url }] : undefined },
  };
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getAgentBySlug(slug);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
        <ErrorState title="Profil agen gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/agen/${slug}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <AgentDetailView agent={res.agent} listings={res.listings} listingsOk={res.listingsOk} />;
}
