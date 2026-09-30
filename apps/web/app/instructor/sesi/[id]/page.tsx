// app/instructor/sesi/[id]/page.tsx — Detail Sesi (M04, Fase 6).
import { notFound } from "next/navigation";
import { SessionDetailView } from "@/components/instructor/SessionDetailView";
import { getCourseOptions, getSessionDetailBundle } from "@/lib/instructor/session-data";
import { ErrorState } from "@/components/ui/States";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Sesi | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function SessionDetailPage({ params }: Props) {
  await requireArea("instructor");
  const { id } = await params;
  const [bundle, courses] = await Promise.all([getSessionDetailBundle(id), getCourseOptions()]);

  if (!bundle.session.ok) {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-8">
        <ErrorState title="Sesi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  if (!bundle.session.data) notFound();

  return <SessionDetailView session={bundle.session.data} courses={courses} roster={bundle.roster} team={bundle.team} artifacts={bundle.artifacts} />;
}
