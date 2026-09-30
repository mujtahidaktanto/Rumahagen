// app/instructor/kursus/baru/page.tsx — Buat Kursus (M04, Fase 6).
import { CourseFormView } from "@/components/instructor/CourseFormView";
import { getCoursesForPrereqPicker } from "@/lib/instructor/course-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Kursus | RumahAgen" };

export default async function NewCoursePage() {
  await requireArea("instructor");
  const prereqOptions = await getCoursesForPrereqPicker();
  return <CourseFormView prereqOptions={prereqOptions.ok ? prereqOptions.data : []} />;
}
