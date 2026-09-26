// app/agent/page.tsx — Dashboard Agent (M08 Dashboard). Data dimuat di server (lib/agent/dashboard-data.ts); layout /agent sudah menjaga sesi dan peran.
import { DashboardView } from "@/components/agent/DashboardView";
import { getAgentDashboard } from "@/lib/agent/dashboard-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AgentHomePage() {
  const user = await requireArea("agent");
  const data = await getAgentDashboard(user.id);
  return <DashboardView name={user.name} data={data} />;
}
