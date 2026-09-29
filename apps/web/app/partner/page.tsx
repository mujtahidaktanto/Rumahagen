// app/partner/page.tsx — Dashboard Developer Partner (M08, Fase 6). Menggantikan placeholder "dibangun di Fase 6".
import { PartnerDashboardView } from "@/components/partner/PartnerDashboardView";
import { getPartnerDashboard } from "@/lib/partner/dashboard-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | RumahAgen" };

export default async function PartnerHomePage() {
  const user = await requireArea("partner");
  const data = await getPartnerDashboard(user.id);
  return <PartnerDashboardView data={data} />;
}
