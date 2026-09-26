// app/admin/bank/page.tsx — Bank Master (M07): tab lewat query string (?tab=banks|oversight&agent_id=).
import { BankMasterView } from "@/components/admin/BankMasterView";
import { getBanks, getDbrOversight } from "@/lib/admin/bank-master-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bank Master | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminBankMasterPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const viewerRole = user.role as AdminViewerRole;
  const sp = await searchParams;

  const tab: "banks" | "oversight" = one(sp.tab) === "oversight" ? "oversight" : "banks";
  const agentIdFilter = one(sp.agent_id);
  const canConfigure = viewerRole === "superadmin" || viewerRole === "admin";

  const banks = await getBanks();
  const simulations = tab === "oversight" ? await getDbrOversight({ agentId: agentIdFilter }) : null;

  return <BankMasterView tab={tab} canConfigure={canConfigure} banks={banks} agentIdFilter={agentIdFilter} simulations={simulations} />;
}
