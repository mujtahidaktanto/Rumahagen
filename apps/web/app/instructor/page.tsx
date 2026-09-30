// app/instructor/page.tsx — Dashboard Instruktur (M08, Fase 6). Menggantikan placeholder "dibangun di Fase 6".
import { InstructorDashboardView } from "@/components/instructor/InstructorDashboardView";
import { getInstructorDashboard } from "@/lib/instructor/dashboard-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | RumahAgen" };

export default async function InstructorHomePage() {
  const user = await requireArea("instructor");
  const data = await getInstructorDashboard(user.id);
  return <InstructorDashboardView name={user.name} data={data} />;
}
