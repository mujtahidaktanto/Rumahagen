// app/(publik)/dbr/shared/[token]/page.tsx — hasil simulasi DBR untuk prospek (M07), tanpa login. Token salah, dicabut, atau tidak ada = tidak ditemukan (tanpa membedakan alasan). Tidak diindeks mesin pencari dan
// tidak mengirim referrer. Data dipilih di server (getSharedDbr); baris mentah tidak pernah diteruskan ke browser.
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { SharedDbrView } from "@/components/public/SharedDbrView";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getSharedDbr } from "@/lib/agent/dbr-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hasil Simulasi DBR | RumahAgen", robots: { index: false, follow: false }, referrer: "no-referrer" };

type Props = { params: Promise<{ token: string }> };

export default async function SharedDbrPage({ params }: Props) {
  const { token } = await params;
  const res = await getSharedDbr(token);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-12">
        <ErrorState title="Hasil simulasi gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/dbr/shared/${token}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <SharedDbrView data={res.data} />;
}
