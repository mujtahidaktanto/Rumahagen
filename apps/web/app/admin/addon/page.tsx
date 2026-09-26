// app/admin/addon/page.tsx — Katalog Add-on (M14).
import { CommercialAddonView } from "@/components/admin/CommercialAddonView";
import { getAddons, getActivePromotionsForPicker } from "@/lib/admin/commercial-catalog-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Katalog Add-on | RumahAgen" };

export default async function AdminAddonCatalogPage() {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin" || user.role === "admin";
  const [addons, promotions] = await Promise.all([getAddons(), getActivePromotionsForPicker()]);
  return <CommercialAddonView canManage={canManage} addons={addons} promotions={promotions} />;
}
