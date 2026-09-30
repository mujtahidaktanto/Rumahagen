// app/admin/konten/konten-publik/[id]/page.tsx — Ubah halaman Konten Publik (M11).
import { notFound } from "next/navigation";
import { StaticContentFormView } from "@/components/admin/StaticContentFormView";
import { getStaticContentById } from "@/lib/admin/content-notif-data";
import { ErrorState } from "@/components/ui/States";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ubah Halaman Konten Publik | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function EditStaticContentPage({ params }: Props) {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin" || user.role === "admin";
  const { id } = await params;
  const result = await getStaticContentById(id);
  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-8">
        <ErrorState title="Halaman konten gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  if (!result.data) notFound();
  return <StaticContentFormView content={result.data} canManage={canManage} />;
}
