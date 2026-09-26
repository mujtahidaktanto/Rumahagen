// lib/agent/org-data.ts — data layar Organisasi Agent (M12 Dashboard dan Kelola Anggota), dibaca di server dengan RLS pemanggil. Keanggotaan sendiri dibaca dari organization_members (RLS: anggota),
// nama anggota/pemohon lewat RPC (RLS agent_profiles tidak mengizinkan sesama anggota membaca profil; migration 0161). Tiap bagian dimuat sendiri-sendiri (gagal satu tidak menjatuhkan halaman).
// Bila Agent aktif di lebih dari satu organisasi, yang ditampilkan adalah keanggotaan terbaru (wireframe mengasumsikan satu organisasi; lihat audit/FRONTEND_GAPS.md).
import { createClient } from "@/lib/supabase/server";
import type { ListingQuotaSummary } from "@/lib/validation/listing-quota";
import type { Part } from "./dashboard-data";

export type MyInvitation = { id: string; organizationId: string; organizationName: string; organizationType: string; leaderName: string; createdAt: string; expiresAt: string | null; isExpired: boolean };
export type RosterMember = { memberId: string; agentId: string; role: string; joinedAt: string; name: string; isSelf: boolean };
export type PendingRequest = { id: string; kind: "leader_invite" | "agent_request"; createdAt: string; expiresAt: string | null; isExpired: boolean; agentName: string; agentOffice: string | null };

export type OrgInfo = {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  status: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  website: string | null;
  social: Record<string, unknown> | null;
  address: string | null;
  phone: string | null;
};

export type MyOrgData = {
  membershipId: string;
  role: string;
  org: OrgInfo;
  roster: Part<RosterMember[]>;
  pendingCount: Part<number> | null; // null = bukan leader
  listingCount: Part<number>;
  quota: Part<ListingQuotaSummary>;
};
export type OrgPageData = { state: "error" } | { state: "no_org"; invitations: Part<MyInvitation[]> } | ({ state: "org" } & MyOrgData);

type OrgRow = { organization_name: string; slug: string | null; organization_type: string; status: string; logo_url: string | null; banner_url: string | null; description: string | null; website: string | null; social_media: Record<string, unknown> | null; address: string | null; contact_phone: string | null };
type MembershipRow = { id: string; role: string; organization_id: string; organization: OrgRow | null };

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function loadMembership(supabase: Supabase, userId: string): Promise<{ error: true } | { row: MembershipRow | null; error?: false }> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, role, organization_id, organization:organizations(organization_name, slug, organization_type, status, logo_url, banner_url, description, website, social_media, address, contact_phone)")
    .eq("agent_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false })
    .limit(1)
    .returns<MembershipRow[]>();
  if (error) return { error: true };
  return { row: data?.[0] ?? null };
}

const toInfo = (id: string, o: OrgRow): OrgInfo => ({
  id,
  name: o.organization_name,
  slug: o.slug,
  type: o.organization_type,
  status: o.status,
  logoUrl: o.logo_url,
  bannerUrl: o.banner_url,
  description: o.description,
  website: o.website,
  social: o.social_media,
  address: o.address,
  phone: o.contact_phone,
});

async function loadRoster(supabase: Supabase, orgId: string): Promise<Part<RosterMember[]>> {
  const { data, error } = await supabase.rpc("organization_roster", { p_organization_id: orgId });
  if (error) return { ok: false };
  const rows = (data ?? []) as { member_id: string; agent_id: string; role: string; joined_at: string; agent_name: string; is_self: boolean }[];
  return { ok: true, data: rows.map((r) => ({ memberId: r.member_id, agentId: r.agent_id, role: r.role, joinedAt: r.joined_at, name: r.agent_name, isSelf: r.is_self })) };
}

async function loadPending(supabase: Supabase, orgId: string): Promise<Part<PendingRequest[]>> {
  const { data, error } = await supabase.rpc("organization_pending_requests", { p_organization_id: orgId });
  if (error) return { ok: false };
  const rows = (data ?? []) as { id: string; initiated_by_type: string; created_at: string; expires_at: string | null; is_expired: boolean; agent_name: string; agent_office: string | null }[];
  return {
    ok: true,
    data: rows.map((r) => ({ id: r.id, kind: r.initiated_by_type === "agent_request" ? "agent_request" : "leader_invite", createdAt: r.created_at, expiresAt: r.expires_at, isExpired: r.is_expired, agentName: r.agent_name, agentOffice: r.agent_office })),
  };
}

export async function getMyInvitations(supabase?: Supabase): Promise<Part<MyInvitation[]>> {
  const sb = supabase ?? (await createClient());
  const { data, error } = await sb.rpc("my_organization_invitations");
  if (error) return { ok: false };
  const rows = (data ?? []) as { id: string; organization_id: string; organization_name: string; organization_type: string; leader_name: string; created_at: string; expires_at: string | null; is_expired: boolean }[];
  return {
    ok: true,
    data: rows.map((r) => ({ id: r.id, organizationId: r.organization_id, organizationName: r.organization_name, organizationType: r.organization_type, leaderName: r.leader_name, createdAt: r.created_at, expiresAt: r.expires_at, isExpired: r.is_expired })),
  };
}

export async function getOrgPage(userId: string): Promise<OrgPageData> {
  const supabase = await createClient();
  const m = await loadMembership(supabase, userId);
  if ("error" in m && m.error) return { state: "error" };
  const row = (m as { row: MembershipRow | null }).row;
  if (!row || !row.organization) return { state: "no_org", invitations: await getMyInvitations(supabase) };

  const orgId = row.organization_id;
  const isLeader = row.role === "leader";
  const [roster, pending, listings, quota] = await Promise.all([
    loadRoster(supabase, orgId),
    isLeader ? loadPending(supabase, orgId) : Promise.resolve(null),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "published").is("deleted_at", null),
    supabase.rpc("listing_quota_summary", { p_organization_id: orgId }),
  ]);
  return {
    state: "org",
    membershipId: row.id,
    role: row.role,
    org: toInfo(orgId, row.organization),
    roster,
    pendingCount: pending ? (pending.ok ? { ok: true, data: pending.data.filter((p) => !p.isExpired).length } : { ok: false }) : null,
    listingCount: listings.error ? { ok: false } : { ok: true, data: listings.count ?? 0 },
    quota: quota.error || !quota.data ? { ok: false } : { ok: true, data: quota.data as ListingQuotaSummary },
  };
}

export type OrgMembersPageData =
  | { state: "error" }
  | { state: "no_org" }
  | { state: "org"; role: string; org: Pick<OrgInfo, "id" | "name" | "status">; roster: Part<RosterMember[]>; pending: Part<PendingRequest[]> | null };

export async function getOrgMembersPage(userId: string): Promise<OrgMembersPageData> {
  const supabase = await createClient();
  const m = await loadMembership(supabase, userId);
  if ("error" in m && m.error) return { state: "error" };
  const row = (m as { row: MembershipRow | null }).row;
  if (!row || !row.organization) return { state: "no_org" };
  const isLeader = row.role === "leader";
  const [roster, pending] = await Promise.all([loadRoster(supabase, row.organization_id), isLeader ? loadPending(supabase, row.organization_id) : Promise.resolve(null)]);
  return { state: "org", role: row.role, org: { id: row.organization_id, name: row.organization.organization_name, status: row.organization.status }, roster, pending };
}

export type JoinState = "member" | "invited" | "requested" | "can_request";

/** Keadaan Agent terhadap satu organisasi (untuk kartu "Bergabung" di halaman publik): anggota aktif, punya undangan pending, sudah mengajukan, atau boleh mengajukan. */
export async function getMyJoinState(orgId: string, userId: string): Promise<JoinState> {
  const supabase = await createClient();
  const { data: mem } = await supabase.from("organization_members").select("id").eq("organization_id", orgId).eq("agent_id", userId).eq("status", "active").limit(1);
  if (mem && mem.length > 0) return "member";
  const { data: inv } = await supabase.from("organization_invitations").select("initiated_by_type").eq("organization_id", orgId).eq("agent_id", userId).eq("status", "pending").limit(2).returns<{ initiated_by_type: string }[]>();
  if (inv?.some((i) => i.initiated_by_type === "leader_invite")) return "invited";
  if (inv?.some((i) => i.initiated_by_type === "agent_request")) return "requested";
  return "can_request";
}
