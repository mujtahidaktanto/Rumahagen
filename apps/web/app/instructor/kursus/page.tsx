// app/instructor/kursus/page.tsx — Kursus Saya (M04, Fase 6): filter lewat query string (?status=&category=&q=).
import { MyCoursesView } from "@/components/instructor/MyCoursesView";
import { getMyCourses } from "@/lib/instructor/course-data";
import type { CourseStatus } from "@/lib/instructor/course-rules";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kursus Saya | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const STATUSES: CourseStatus[] = ["draft", "pending_review", "published", "archived"];

export default async function MyCoursesPage({ searchParams }: Props) {
  const user = await requireArea("instructor");
  const sp = await searchParams;
  const statusParam = one(sp.status);
  const status: CourseStatus | "all" = STATUSES.includes(statusParam as CourseStatus) ? (statusParam as CourseStatus) : "all";
  const category = one(sp.category) ?? "all";
  const q = (one(sp.q) ?? "").trim();

  const courses = await getMyCourses(user.id, {});

  return <MyCoursesView courses={courses} status={status} category={category} q={q} />;
}
