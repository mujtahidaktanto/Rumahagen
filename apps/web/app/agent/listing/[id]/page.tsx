// app/agent/listing/[id]/page.tsx — Detail Listing milik Agent (M03 Listing-Detail). Hanya pemilik yang melihat (listing orang lain/tidak ada = "tidak ditemukan"); data lib/agent/listing-detail-data.ts.
import { notFound } from "next/navigation";
import { MyListingDetailView } from "@/components/agent/MyListingDetailView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getMyListingDetail } from "@/lib/agent/listing-detail-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Listing | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function MyListingDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireArea("agent");
  const res = await getMyListingDetail(id, user.id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-4 lg:p-8">
        <ErrorState title="Listing gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/agent/listing/${id}` as never} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <MyListingDetailView data={res} />;
}
