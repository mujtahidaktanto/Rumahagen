// app/instructor/kursus/[id]/page.tsx — Detail Kursus (M04, Fase 6): tab lewat query string (?tab=ringkasan|pelajaran|kuis). notFound() bila bukan pemilik (getCourseDetail
// mengembalikan data null baik untuk kursus tak ada maupun kursus milik instruktur lain — lihat komentar lib/instructor/course-data.ts).
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/instructor/CourseDetailView";
import { getCourseDetail, getCourseLessons, getCourseQuizzes, getCoursesForPrereqPicker } from "@/lib/instructor/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Kursus | RumahAgen" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type Tab = "ringkasan" | "pelajaran" | "kuis";
const TABS: Tab[] = ["ringkasan", "pelajaran", "kuis"];

export default async function InstructorCourseDetailPage({ params, searchParams }: Props) {
  const user = await requireArea("instructor");
  const { id } = await params;
  const sp = await searchParams;
  const tabParam = one(sp.tab);
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "ringkasan";

  const course = await getCourseDetail(id, user.id);
  if (!course.ok) {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-8">
        <h1 className="text-headline">Detail Kursus</h1>
        <p className="mt-2 text-body-md text-danger-600">Kursus gagal dimuat. Muat ulang halaman ini beberapa saat lagi.</p>
      </div>
    );
  }
  if (!course.data) notFound();

  const [lessons, quizzes, prereqOptions] = await Promise.all([getCourseLessons(id), getCourseQuizzes(id), getCoursesForPrereqPicker(id)]);

  return <CourseDetailView course={course.data} tab={tab} lessons={lessons} quizzes={quizzes} prereqOptions={prereqOptions.ok ? prereqOptions.data : []} />;
}
