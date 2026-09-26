// app/admin/kursus/[id]/sertifikat/page.tsx — Sertifikat Kursus (M04).
import { notFound } from "next/navigation";
import { CertificateConfigView } from "@/components/admin/CertificateConfigView";
import { getCourseCertificateConfig, getCourseDetail, getLearningSettingsDefaults, getLinkableTitles } from "@/lib/admin/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sertifikat Kursus | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminCourseCertificatePage({ params }: Props) {
  await requireArea("admin");
  const { id } = await params;

  const [course, config, defaults, titles] = await Promise.all([getCourseDetail(id), getCourseCertificateConfig(id), getLearningSettingsDefaults(), getLinkableTitles()]);
  if (!course.ok || !config.ok) notFound();

  return <CertificateConfigView courseId={id} courseTitle={course.data.title} config={config.data} defaults={defaults.ok ? defaults.data : null} titles={titles.ok ? titles.data : []} />;
}
