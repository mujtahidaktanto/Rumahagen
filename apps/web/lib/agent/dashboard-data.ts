// lib/agent/dashboard-data.ts — data Dashboard Agent (M08 Dashboard), dibaca di server dengan RLS pemanggil (sama seperti route /api/agents/me/*). Tiap bagian (angka, listing terbaru,
// notifikasi) dimuat sendiri-sendiri: gagal di satu bagian menampilkan keadaan gagal bagian itu saja, bukan seluruh halaman. Angka bulan ini memakai tanggal kalender WIB.
import type { SupabaseClient } from "@supabase/supabase-js";
import { isLeaderContext, type ActiveContext } from "@/lib/agent/context";
import { loadAgentStats } from "@/lib/analytics/agent-stats";
import { createClient } from "@/lib/supabase/server";

export type Part<T> = { ok: true; data: T } | { ok: false };

export type DashboardStats = { activeListings: number; views: number; leads: number; points: number | null };
export type RecentListing = { id: string; title: string; status: string; location: string | null; coverUrl: string | null };
export type DashboardNotification = { id: string; title: string; message: string | null; createdAt: string; isRead: boolean };
export type DashboardNotifications = { items: DashboardNotification[]; unread: number };

/** Cakupan angka dan listing di Dashboard menurut konteks aktif: pribadi, organisasi (pemimpin: seluruh organisasi), atau organisasi sebagai anggota (listing organisasi milik sendiri; angka tetap pribadi). */
export type DashboardScope = { kind: "personal" | "org_leader" | "org_member"; label: string };

export type DashboardData = {
  scope: DashboardScope;
  /** agent_profiles.ktp_requirement_state = 'submitted' (verifikasi identitas sedang ditinjau; hanya informasi, fitur tetap terbuka). */
  identityInReview: boolean;
  stats: Part<DashboardStats>;
  listings: Part<RecentListing[]>;
  notifications: Part<DashboardNotifications>;
};

export { monthRangeWIB, relativeTimeId, todayWIB } from "./time";
import { monthRangeWIB } from "./time";

async function loadStats(supabase: SupabaseClient, now: Date, organizationId?: string): Promise<Part<DashboardStats>> {
  try {
    const { from, to } = monthRangeWIB(now);
    const s = await loadAgentStats(supabase, { from, to, compare: false, organizationId });
    const val = (key: string) => s.series.find((x) => x.key === key)?.value ?? 0;
    return { ok: true, data: { activeListings: s.summary.active_listings ?? 0, views: val("views"), leads: val("leads"), points: s.summary.learning?.points_balance ?? null } };
  } catch {
    return { ok: false };
  }
}

type ListingRow = {
  id: string;
  title: string;
  status: string;
  city: { name: string } | null;
  province: { name: string } | null;
  photos: { url: string; is_cover: boolean; sort_order: number }[] | null;
};

async function loadListings(supabase: SupabaseClient, userId: string, context: ActiveContext): Promise<Part<RecentListing[]>> {
  const orgId = context.kind === "org" ? context.org.id : null;
  let q = supabase
    .from("listings")
    .select("id, title, status, city:ref_cities(name), province:ref_provinces(name), photos:listing_photos(url, is_cover, sort_order)")
    .is("deleted_at", null);
  // Pemimpin melihat semua listing organisasi (migration 0162); anggota dan mode pribadi hanya listing milik sendiri, dipisah menurut organisasi.
  if (!isLeaderContext(context)) q = q.eq("agent_id", userId);
  q = orgId ? q.eq("organization_id", orgId) : q.is("organization_id", null);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(3).returns<ListingRow[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((l) => {
      const cover = [...(l.photos ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0];
      return { id: l.id, title: l.title, status: l.status, location: [l.city?.name, l.province?.name].filter(Boolean).join(", ") || null, coverUrl: cover?.url ?? null };
    }),
  };
}

async function loadNotifications(supabase: SupabaseClient, userId: string): Promise<Part<DashboardNotifications>> {
  const [list, unread] = await Promise.all([
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
  if (list.error || unread.error) return { ok: false };
  return { ok: true, data: { unread: unread.count ?? 0, items: (list.data ?? []).map((n) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.created_at, isRead: n.is_read })) } };
}

export async function getAgentDashboard(userId: string, context: ActiveContext, now: Date = new Date()): Promise<DashboardData> {
  const supabase = await createClient();
  const leader = isLeaderContext(context);
  const scope: DashboardScope = context.kind === "personal" ? { kind: "personal", label: "Pribadi" } : { kind: leader ? "org_leader" : "org_member", label: context.org.name };
  const [stats, listings, notifications, profile] = await Promise.all([
    // Statistik organisasi hanya untuk pemimpin (RPC menolak anggota); anggota tetap melihat angka pribadinya.
    loadStats(supabase, now, leader && context.kind === "org" ? context.org.id : undefined),
    loadListings(supabase, userId, context),
    loadNotifications(supabase, userId),
    supabase.from("agent_profiles").select("ktp_requirement_state").eq("user_id", userId).maybeSingle<{ ktp_requirement_state: string }>(),
  ]);
  return { scope, identityInReview: profile.data?.ktp_requirement_state === "submitted", stats, listings, notifications };
}
