// app/admin/paket/page.tsx — Paket Langganan (M14).
import { CommercialPlanView } from "@/components/admin/CommercialPlanView";
import { getPlans, getActivePromotionsForPicker } from "@/lib/admin/commercial-catalog-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paket Langganan | RumahAgen" };

export default async function AdminPlanCatalogPage() {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin" || user.role === "admin";
  const [plans, promotions] = await Promise.all([getPlans(), getActivePromotionsForPicker()]);
  return <CommercialPlanView canManage={canManage} plans={plans} promotions={promotions} />;
}
