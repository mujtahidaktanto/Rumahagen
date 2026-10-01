// app/partner/proyek/[id]/page.tsx — Detail/Ubah Proyek (M06, Fase 6): form penuh + status + media, digabung satu halaman (bukan dua layar terpisah seperti
// wireframe Detail-Proyek/Form-Proyek — keputusan sesi ini untuk mengurangi navigasi, semua field yang sama tetap ada).
import { notFound } from "next/navigation";
import { ProjectFormView } from "@/components/partner/ProjectFormView";
import { getMyProjectById, getProjectMedia } from "@/lib/partner/project-data";
import { ErrorState } from "@/components/ui/States";
import { getAiAvailability } from "@/lib/ai/platform/feature-available";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Proyek | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  await requireArea("partner");
  const { id } = await params;
  const [project, media, aiAvailable] = await Promise.all([getMyProjectById(id), getProjectMedia(id), getAiAvailability("project_description")]);
  if (!project.ok) {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-8">
        <ErrorState title="Proyek gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  if (!project.data) notFound();
  return <ProjectFormView developerId={project.data.developerId} project={project.data} media={media} aiAvailable={aiAvailable} />;
}
