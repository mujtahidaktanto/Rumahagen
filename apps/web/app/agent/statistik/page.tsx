// app/agent/statistik/page.tsx — Statistik Saya (M08). Rentang, perbandingan, dan cakupan (Milik Saya / organisasi bagi pemimpin) lewat URL; data dari RPC agent_statistics_* dengan RLS pemanggil
// (lib/analytics/agent-stats.ts, sama dengan GET /api/agents/me/statistics). Gagal memuat (termasuk cakupan organisasi yang ditolak DB) = keadaan gagal, bukan halaman error.
import { StatsView } from "@/components/agent/StatsView";
import { getActiveContext, getMyContextOrgs } from "@/lib/agent/shell-data";
import { parseStatsSearch } from "@/lib/agent/stats-view";
import { todayWIB } from "@/lib/agent/time";
import { loadAgentStats, type AgentStats } from "@/lib/analytics/agent-stats";
import { requireArea } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statistik Saya | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function StatsPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const orgs = await getMyContextOrgs(user.id);
  const leaderOrgs = orgs.filter((o) => o.role === "leader").map((o) => ({ id: o.id, name: o.name }));
  const context = await getActiveContext(user.id, orgs);
  const state = parseStatsSearch(await searchParams, todayWIB(), leaderOrgs.map((o) => o.id), context.kind === "org" ? context.org.id : null);

  let stats: AgentStats | null = null;
  try {
    stats = await loadAgentStats(await createClient(), { from: state.from, to: state.to, compare: state.compare, organizationId: state.org ?? undefined });
  } catch {
    stats = null;
  }
  return <StatsView stats={stats} state={state} leaderOrgs={leaderOrgs} />;
}
