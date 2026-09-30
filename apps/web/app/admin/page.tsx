// app/admin/page.tsx — Dashboard Analytics (M09, wireframe 02-Admin/M09-Dashboard-Analytics). Menggantikan placeholder AreaHome. Rentang dan perbandingan lewat URL; data
// dari RPC admin_analytics_flow/funnel dan tabel metrics_daily_snapshot dengan RLS pemanggil (lib/analytics/dashboard.ts, sama dengan GET /api/admin/analytics/dashboard).
// Gagal memuat (termasuk non-staf yang lolos requireArea tapi ditolak RPC) = keadaan gagal, bukan halaman error. Export hanya untuk Superadmin.
import { AdminAnalyticsDashboardView } from "@/components/admin/AdminAnalyticsDashboardView";
import { parseAnalyticsSearch } from "@/lib/admin/analytics-view";
import { todayWIB } from "@/lib/agent/time";
import { loadDashboard, type Dashboard } from "@/lib/analytics/dashboard";
import { requireArea } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard Analytics | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminHomePage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const state = parseAnalyticsSearch(await searchParams, todayWIB());

  let dashboard: Dashboard | null = null;
  try {
    dashboard = await loadDashboard(await createClient(), { from: state.from, to: state.to, compare: state.compare });
  } catch {
    dashboard = null;
  }
  return <AdminAnalyticsDashboardView dashboard={dashboard} state={state} canExport={user.role === "superadmin"} />;
}
