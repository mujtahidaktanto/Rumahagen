// lib/admin/audit-data.ts — data Audit & Oversight (M09): tab Audit Log (audit_logs, 0012, append-only, RLS audit_logs_select m09.administrative_audit_log.view — Superadmin+Admin 'all',
// Manager TIDAK ada grant sama sekali, 0084) dan tab Antrean Review Agent (users role='agent' status='pending_review' — nilai manual staf sejak default otomatis dihapus, migration 0083;
// diharapkan hampir selalu kosong). Aktor (user_id) dan Organisasi (organization_id) di audit_logs adalah UUID mentah tanpa join bawaan API-149 — di sini diresolusi ke email/nama untuk
// tampilan lewat lookup tambahan (organizations lewat nested select RLS, aktor lewat Supabase Admin API, pola sama seperti lib/admin/staff-data.ts).
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";

export const AUDIT_PAGE_SIZE = 30;

export type AuditLogRow = {
  id: string;
  createdAt: string;
  action: string;
  entityType: string | null;
  actor: string;
  organization: string;
  changeSummary: string;
};

export type AuditLogFilters = { entityType?: string; action?: string; userId?: string };

function summarize(oldValue: unknown, newValue: unknown): string {
  if (oldValue != null && newValue != null) return `${JSON.stringify(oldValue)}→${JSON.stringify(newValue)}`;
  if (newValue != null) return JSON.stringify(newValue);
  if (oldValue != null) return JSON.stringify(oldValue);
  return "—";
}

export async function getAuditLogPage(filters: AuditLogFilters, page: number): Promise<Part<{ rows: AuditLogRow[]; total: number; hasMore: boolean }>> {
  const supabase = await createClient();
  const offset = Math.max(0, page - 1) * AUDIT_PAGE_SIZE;

  let query = supabase
    .from("audit_logs")
    .select("id, user_id, action, entity_type, organization_id, old_value, new_value, created_at, organizations(organization_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + AUDIT_PAGE_SIZE - 1);

  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.userId) query = query.eq("user_id", filters.userId);

  const { data, count, error } = await query.returns<
    { id: string; user_id: string | null; action: string; entity_type: string | null; organization_id: string | null; old_value: unknown; new_value: unknown; created_at: string; organizations: { organization_name: string } | null }[]
  >();
  if (error) return { ok: false };

  const actorIds = [...new Set((data ?? []).map((r) => r.user_id).filter((v): v is string => !!v))];
  const emailById = new Map<string, string>();
  if (actorIds.length > 0) {
    const admin = createAdminClient();
    const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!authErr) {
      for (const u of authList.users) if (u.email) emailById.set(u.id, u.email);
    }
  }

  const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const rows: AuditLogRow[] = (data ?? []).map((r) => ({
    id: r.id,
    createdAt: dtf.format(new Date(r.created_at)),
    action: r.action,
    entityType: r.entity_type,
    actor: r.user_id ? (emailById.get(r.user_id) ?? r.user_id) : "—",
    organization: r.organizations?.organization_name ?? "—",
    changeSummary: summarize(r.old_value, r.new_value),
  }));

  const total = count ?? rows.length;
  return { ok: true, data: { rows, total, hasMore: offset + rows.length < total } };
}

export type AgentReviewRow = { id: string; name: string; email: string | null; createdAt: string };

export async function getAgentReviewQueue(): Promise<Part<AgentReviewRow[]>> {
  const supabase = await createClient();

  const { data: agentRole, error: roleErr } = await supabase.from("roles").select("id").eq("code", "agent").maybeSingle();
  if (roleErr || !agentRole) return { ok: false };

  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id, created_at")
    .eq("role_id", agentRole.id)
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .returns<{ id: string; created_at: string }[]>();
  if (usersErr) return { ok: false };
  if (!users || users.length === 0) return { ok: true, data: [] };

  const userIds = users.map((u) => u.id);
  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", userIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const authById = new Map(authList.users.map((u) => [u.id, u]));

  return {
    ok: true,
    data: users.map((u) => {
      const authUser = authById.get(u.id);
      const email = authUser?.email ?? null;
      return {
        id: u.id,
        name: nameByUser.get(u.id)?.trim() || email?.split("@")[0] || u.id.slice(0, 8),
        email,
        createdAt: u.created_at,
      };
    }),
  };
}
