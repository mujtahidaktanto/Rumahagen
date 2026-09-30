// app/instructor/sesi/baru/page.tsx — Buat Sesi (M04, Fase 6).
import { SessionFormView } from "@/components/instructor/SessionFormView";
import { getCourseOptions } from "@/lib/instructor/session-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Sesi | RumahAgen" };

export default async function NewSessionPage() {
  await requireArea("instructor");
  const courses = await getCourseOptions();
  return <SessionFormView courses={courses} />;
}
