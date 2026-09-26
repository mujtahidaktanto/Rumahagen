// app/admin/kursus/[id]/page.tsx — Detail Kursus (M04): tab lewat query string (?tab=ringkasan|pelajaran|kuis|peserta).
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/admin/CourseDetailView";
import { getCourseDetail, getCourseEnrollments, getCourseLessons, getCourseQuizzes, getCoursesForPrereqPicker, getInstructorsForPicker } from "@/lib/admin/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Kursus | RumahAgen" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type Tab = "ringkasan" | "pelajaran" | "kuis" | "peserta";
const TABS: Tab[] = ["ringkasan", "pelajaran", "kuis", "peserta"];

export default async function AdminCourseDetailPage({ params, searchParams }: Props) {
  await requireArea("admin");
  const { id } = await params;
  const sp = await searchParams;
  const tabParam = one(sp.tab);
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "ringkasan";

  const course = await getCourseDetail(id);
  if (!course.ok) notFound();

  const [lessons, quizzes, instructors, prereqOptions, enrollments] = await Promise.all([
    getCourseLessons(id),
    getCourseQuizzes(id),
    getInstructorsForPicker(),
    getCoursesForPrereqPicker(id),
    tab === "peserta" ? getCourseEnrollments(id) : Promise.resolve(null),
  ]);

  return (
    <CourseDetailView
      course={course.data}
      tab={tab}
      lessons={lessons}
      quizzes={quizzes}
      enrollments={enrollments}
      instructors={instructors.ok ? instructors.data : []}
      prereqOptions={prereqOptions.ok ? prereqOptions.data : []}
    />
  );
}
