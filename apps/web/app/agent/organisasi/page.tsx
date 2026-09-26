// app/agent/organisasi/page.tsx — Organisasi (M12): belum tergabung (undangan untuk Anda, Buat/Cari organisasi) atau dashboard organisasi (angka, kuota, anggota, branding, aksi menurut peran).
import { OrganizationView } from "@/components/agent/OrganizationView";
import { maskEmail } from "@/lib/agent/mask-email";
import { getOrgPage } from "@/lib/agent/org-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organisasi | RumahAgen" };

export default async function AgentOrganizationPage() {
  const user = await requireArea("agent");
  return <OrganizationView data={await getOrgPage(user.id)} maskedEmail={maskEmail(user.email)} />;
}
