// app/partner/proyek/baru/page.tsx — Buat Proyek Baru (M06, Fase 6). developer_id dikunci ke perusahaan akun login (bukan pemilih, beda dari layar Admin).
import { redirect } from "next/navigation";
import { ProjectFormView } from "@/components/partner/ProjectFormView";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { getAiAvailability } from "@/lib/ai/platform/feature-available";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Proyek Baru | RumahAgen" };

export default async function NewProjectPage() {
  const user = await requireArea("partner");
  const [profile, aiAvailable] = await Promise.all([getMyPartnerProfile(user.id), getAiAvailability("project_description")]);
  if (!profile.ok || !profile.data) redirect("/partner/proyek");
  return <ProjectFormView developerId={profile.data.id} aiAvailable={aiAvailable} />;
}
