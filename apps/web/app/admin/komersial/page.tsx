// app/admin/komersial/page.tsx — Komersial & Rekonsiliasi (M14).
import { CommercialReconciliationView } from "@/components/admin/CommercialReconciliationView";
import { getReconciliationCases } from "@/lib/admin/commercial-reconciliation-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Komersial & Rekonsiliasi | RumahAgen" };

export default async function AdminCommercialReconciliationPage() {
  const user = await requireArea("admin");
  const viewerRole = user.role as AdminViewerRole;
  const canView = viewerRole === "superadmin" || viewerRole === "admin";
  const cases = canView ? await getReconciliationCases() : null;
  return <CommercialReconciliationView viewerRole={viewerRole} cases={cases} />;
}
