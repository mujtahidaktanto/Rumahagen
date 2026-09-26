// lib/agent/shell-data.ts — data topbar Agent (dibaca di layout server, RLS pemanggil): notifikasi terbaru + jumlah belum dibaca, organisasi yang diikuti (untuk Context Switcher), dan konteks aktif dari
// cookie yang divalidasi terhadap keanggotaan. Gagal memuat notifikasi = lonceng tanpa angka dengan keadaan gagal; gagal memuat organisasi = hanya konteks Pribadi.
import { cookies } from "next/headers";
import { CONTEXT_COOKIE, resolveContext, type ActiveContext, type ContextOrg } from "@/lib/agent/context";
import { createClient } from "@/lib/supabase/server";

export type ShellNotification = { id: string; title: string; message: string | null; createdAt: string; isRead: boolean; entityType: string | null; entityId: string | null };
export type ShellNotifications = { ok: true; unread: number; items: ShellNotification[] } | { ok: false };
export type ShellData = { notifications: ShellNotifications; orgs: ContextOrg[]; context: ActiveContext };

type MemberRow = { role: string; organization_id: string; organization: { organization_name: string; status: string } | null };

/** Organisasi yang bisa dipilih sebagai konteks: keanggotaan aktif pada organisasi berstatus active atau closing. */
export async function getMyContextOrgs(userId: string): Promise<ContextOrg[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organization_id, organization:organizations(organization_name, status)")
    .eq("agent_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false })
    .limit(20)
    .returns<MemberRow[]>();
  if (error) return [];
  return (data ?? [])
    .filter((m) => m.organization && (m.organization.status === "active" || m.organization.status === "closing"))
    .map((m) => ({ id: m.organization_id, name: m.organization!.organization_name, role: m.role }));
}

/** Konteks aktif (cookie divalidasi terhadap keanggotaan). */
export async function getActiveContext(userId: string, orgs?: ContextOrg[]): Promise<ActiveContext> {
  const list = orgs ?? (await getMyContextOrgs(userId));
  const jar = await cookies();
  return resolveContext(jar.get(CONTEXT_COOKIE)?.value, list);
}

export async function getShellData(userId: string): Promise<ShellData> {
  const supabase = await createClient();
  const [list, unread, orgs] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at, related_entity_type, related_entity_id")
      .eq("user_id", userId)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<{ id: string; title: string; message: string | null; is_read: boolean; created_at: string; related_entity_type: string | null; related_entity_id: string | null }[]>(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("dismissed_at", null).eq("is_read", false),
    getMyContextOrgs(userId),
  ]);
  const notifications: ShellNotifications =
    list.error || unread.error
      ? { ok: false }
      : {
          ok: true,
          unread: unread.count ?? 0,
          items: (list.data ?? []).map((n) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.created_at, isRead: n.is_read, entityType: n.related_entity_type, entityId: n.related_entity_id })),
        };
  return { notifications, orgs, context: await getActiveContext(userId, orgs) };
}
