// app/admin/konten/konten-publik/baru/page.tsx — Buat halaman Konten Publik baru (M11).
import { StaticContentFormView } from "@/components/admin/StaticContentFormView";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Halaman Konten Publik | RumahAgen" };

export default async function NewStaticContentPage() {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin" || user.role === "admin";
  return <StaticContentFormView canManage={canManage} />;
}
