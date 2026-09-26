// app/admin/kursus/page.tsx — Kelola Kursus (M04): filter lewat query string (?status=&category=&q=).
import { CourseListView } from "@/components/admin/CourseListView";
import { getCourses, getCoursesForPrereqPicker, getInstructorsForPicker } from "@/lib/admin/course-data";
import type { CourseStatus } from "@/lib/admin/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Kursus | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const STATUSES: CourseStatus[] = ["draft", "pending_review", "published", "archived"];

export default async function AdminCoursesPage({ searchParams }: Props) {
  await requireArea("admin");
  const sp = await searchParams;
  const statusParam = one(sp.status);
  const status: CourseStatus | "all" = STATUSES.includes(statusParam as CourseStatus) ? (statusParam as CourseStatus) : "all";
  const category = one(sp.category) ?? "all";
  const q = (one(sp.q) ?? "").trim();

  const [courses, instructors, prereqOptions] = await Promise.all([getCourses({}), getInstructorsForPicker(), getCoursesForPrereqPicker()]);

  return (
    <CourseListView
      courses={courses}
      status={status}
      category={category}
      q={q}
      instructors={instructors.ok ? instructors.data : []}
      prereqOptions={prereqOptions.ok ? prereqOptions.data : []}
    />
  );
}
