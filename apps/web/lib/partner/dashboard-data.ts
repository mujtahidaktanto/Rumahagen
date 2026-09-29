// lib/partner/dashboard-data.ts — data Dashboard Developer Partner (M08, wireframe 03-Developer-Partner/M08-Dashboard-Developer). GET /dashboard/summary hanya mengembalikan jumlah notifikasi
// (SOURCE-Developer-Partner.md §6); angka proyek/klaim/event dihitung di sini dari developer_projects/agent_project_claims/events dengan RLS pemanggil (developer_partners.user_id = auth.uid()).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type PendingClaimRow = { id: string; agentName: string; agentSlug: string | null; projectName: string; claimedAt: string };
export type RecentProjectRow = { id: string; name: string; location: string | null; status: string };
export type PartnerDashboardStats = { projectsTotal: number; projectsActive: number; projectsComingSoon: number; claimsPending: number; claimsApproved: number; eventsPending: number };
export type DashboardNotification = { id: string; title: string; message: string | null; createdAt: string; isRead: boolean };

export type PartnerDashboardData = {
  linked: boolean;
  companyName: string | null;
  stats: Part<PartnerDashboardStats>;
  pendingClaims: Part<PendingClaimRow[]>;
  recentProjects: Part<RecentProjectRow[]>;
  notifications: Part<{ unread: number; items: DashboardNotification[] }>;
};

export async function getPartnerDashboard(userId: string): Promise<PartnerDashboardData> {
  const supabase = await createClient();

  const [{ data: partner }, notifList, notifUnread] = await Promise.all([
    supabase.from("developer_partners").select("id, company_name").eq("user_id", userId).eq("status", "active").maybeSingle<{ id: string; company_name: string }>(),
    supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .eq("user_id", userId)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<{ id: string; title: string; message: string | null; is_read: boolean; created_at: string }[]>(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("dismissed_at", null).eq("is_read", false),
  ]);

  const notifications: Part<{ unread: number; items: DashboardNotification[] }> =
    notifList.error || notifUnread.error
      ? { ok: false }
      : { ok: true, data: { unread: notifUnread.count ?? 0, items: (notifList.data ?? []).map((n) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.created_at, isRead: n.is_read })) } };

  if (!partner) {
    return { linked: false, companyName: null, stats: { ok: false }, pendingClaims: { ok: false }, recentProjects: { ok: false }, notifications };
  }

  const { data: projects, error: projErr } = await supabase
    .from("developer_projects")
    .select("id, name, location, status, created_at")
    .eq("developer_id", partner.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<{ id: string; name: string; location: string | null; status: string; created_at: string }[]>();

  if (projErr || !projects) {
    return { linked: true, companyName: partner.company_name, stats: { ok: false }, pendingClaims: { ok: false }, recentProjects: { ok: false }, notifications };
  }

  const projectIds = projects.map((p) => p.id);
  const nameById = new Map(projects.map((p) => [p.id, p.name]));

  const { data: claims, error: claimErr } =
    projectIds.length > 0
      ? await supabase
          .from("agent_project_claims")
          .select("id, agent_id, project_id, status, claimed_at")
          .in("project_id", projectIds)
          .order("claimed_at", { ascending: false })
          .limit(200)
          .returns<{ id: string; agent_id: string; project_id: string; status: string; claimed_at: string }[]>()
      : { data: [] as { id: string; agent_id: string; project_id: string; status: string; claimed_at: string }[], error: null };

  const { count: eventsPending } = await supabase.from("events").select("id", { count: "exact", head: true }).eq("submitted_by", userId).eq("status", "pending_approval");

  if (claimErr) {
    return {
      linked: true,
      companyName: partner.company_name,
      stats: { ok: false },
      pendingClaims: { ok: false },
      recentProjects: { ok: true, data: projects.slice(0, 3).map((p) => ({ id: p.id, name: p.name, location: p.location, status: p.status })) },
      notifications,
    };
  }

  const pendingClaims = (claims ?? []).filter((c) => c.status === "pending").slice(0, 5);
  const agentIds = [...new Set(pendingClaims.map((c) => c.agent_id))];
  const profileByAgent = new Map<string, { full_name: string; public_slug: string | null }>();
  if (agentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("public_agent_profiles")
      .select("user_id, full_name, public_slug")
      .in("user_id", agentIds)
      .returns<{ user_id: string; full_name: string; public_slug: string | null }[]>();
    for (const p of profiles ?? []) profileByAgent.set(p.user_id, { full_name: p.full_name, public_slug: p.public_slug });
  }

  const stats: PartnerDashboardStats = {
    projectsTotal: projects.length,
    projectsActive: projects.filter((p) => p.status === "active").length,
    projectsComingSoon: projects.filter((p) => p.status === "coming_soon").length,
    claimsPending: (claims ?? []).filter((c) => c.status === "pending").length,
    claimsApproved: (claims ?? []).filter((c) => c.status === "approved").length,
    eventsPending: eventsPending ?? 0,
  };

  return {
    linked: true,
    companyName: partner.company_name,
    stats: { ok: true, data: stats },
    pendingClaims: {
      ok: true,
      data: pendingClaims.map((c) => ({
        id: c.id,
        agentName: profileByAgent.get(c.agent_id)?.full_name ?? "Agent",
        agentSlug: profileByAgent.get(c.agent_id)?.public_slug ?? null,
        projectName: nameById.get(c.project_id) ?? "—",
        claimedAt: c.claimed_at,
      })),
    },
    recentProjects: { ok: true, data: projects.slice(0, 3).map((p) => ({ id: p.id, name: p.name, location: p.location, status: p.status })) },
    notifications,
  };
}
