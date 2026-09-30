// app/partner/proyek/page.tsx — Kelola Proyek (M06, Fase 6).
import { MyProjectsView } from "@/components/partner/MyProjectsView";
import { getMyProjects } from "@/lib/partner/project-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proyek Saya | RumahAgen" };

export default async function MyProjectsPage() {
  const user = await requireArea("partner");
  const [profile, projects] = await Promise.all([getMyPartnerProfile(user.id), getMyProjects(user.id)]);
  return <MyProjectsView projects={projects} linked={profile.ok && !!profile.data} />;
}
