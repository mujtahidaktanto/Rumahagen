// app/agent/belajar/[id]/page.tsx — Belajar-Course (M04): materi, kuis, dan Course Selesai untuk satu course yang sudah diikuti. Belum mendaftar = ajakan ke halaman course publik (tempat "Mulai Belajar").
import type { Route } from "next";
import { notFound } from "next/navigation";
import { CourseRunner } from "@/components/agent/CourseRunner";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getCourseRun } from "@/lib/agent/learning-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Belajar Course | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function CourseRunPage({ params }: Props) {
  const { id } = await params;
  const user = await requireArea("agent");
  const res = await getCourseRun(user.id, id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-8">
        <ErrorState title="Course gagal dimuat" message="Terjadi gangguan saat memuat materi. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/agent/belajar/${id}` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  if (res.state === "not_enrolled") {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 py-16 lg:p-8">
        <EmptyState title="Anda belum mendaftar course ini" message={res.title ? `Tekan Mulai Belajar di halaman “${res.title}” untuk membuka materinya.` : "Tekan Mulai Belajar di halaman course untuk membuka materinya."} />
        <div className="flex justify-center gap-3">
          <LinkButton href={`/learning/${res.courseId}` as Route} size="sm">
            Lihat Course
          </LinkButton>
          <LinkButton href={"/agent/belajar" as Route} variant="secondary" size="sm">
            Kembali ke Pembelajaran
          </LinkButton>
        </div>
      </div>
    );
  }
  return <CourseRunner run={res.run} />;
}
