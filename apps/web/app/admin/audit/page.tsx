// app/admin/audit/page.tsx — Audit & Oversight (M09): tab dan filter lewat query string (?tab=&entity_type=&action=&user_id=&page=), tidak ada state klien untuk navigasi ini.
import { AuditOversightView } from "@/components/admin/AuditOversightView";
import { getAgentReviewQueue, getAuditLogPage } from "@/lib/admin/audit-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit & Oversight | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminAuditPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const viewerRole = user.role as AdminViewerRole;
  const sp = await searchParams;

  const tab: "audit" | "review" = one(sp.tab) === "review" ? "review" : "audit";
  const filters = { entityType: one(sp.entity_type), action: one(sp.action), userId: one(sp.user_id) };
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const isAuditAllowed = viewerRole === "superadmin" || viewerRole === "admin";
  const auditPage = tab === "audit" && isAuditAllowed ? await getAuditLogPage(filters, page) : null;
  const reviewQueue = tab === "review" ? await getAgentReviewQueue() : null;

  return <AuditOversightView viewerRole={viewerRole} tab={tab} filters={filters} page={page} auditPage={auditPage} reviewQueue={reviewQueue} />;
}
