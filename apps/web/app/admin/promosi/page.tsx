// app/admin/promosi/page.tsx — Promosi (M14). Manager tidak diberi akses lihat sama sekali (RLS promotions_manage tanpa select policy terpisah).
import { CommercialPromotionView } from "@/components/admin/CommercialPromotionView";
import { getPromotions } from "@/lib/admin/commercial-catalog-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Promosi | RumahAgen" };

export default async function AdminPromotionPage() {
  const user = await requireArea("admin");
  const canView = user.role === "superadmin" || user.role === "admin";
  const promotions = canView ? await getPromotions() : { ok: true as const, data: [] };
  return <CommercialPromotionView canView={canView} canManage={canView} promotions={promotions} />;
}
