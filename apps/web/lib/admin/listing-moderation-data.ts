// lib/admin/listing-moderation-data.ts — Moderasi Listing (M03, wireframe 02-Admin/M03-Moderasi-Listing): 3 tab. RLS listings_select_published_or_owner_or_staff (0162) memberi
// Superadmin/Admin/Manager akses baca SEMUA status listing (bukan cuma published) — cukup untuk tab Antrean Review dan Listing Terbit & Suspend. Tab Leads BEDA: RLS listing_leads_select
// (0047) HANYA mengizinkan pemilik listing + Superadmin (has_permission('m03.listing.update', agent_id), Admin/Manager TIDAK PERNAH diberi grant m03.listing.update) — migration 0162
// menegaskan ini SENGAJA ("data kontak calon pembeli tidak ikut dibuka" ke Admin/Manager), bukan bug seperti gap serupa lain di sesi ini. Jadi tab Leads di sini Superadmin-only.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type ListingModerationRow = { id: string; title: string; agentName: string; createdAt: string; status: "pending_review" | "published" | "suspended" };

async function resolveAgentNames(supabase: Awaited<ReturnType<typeof createClient>>, agentIds: string[]): Promise<Map<string, string>> {
  if (agentIds.length === 0) return new Map();
  const { data: profiles } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", agentIds);
  return new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));
}

export async function getPendingReviewListings(): Promise<Part<ListingModerationRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, agent_id, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title: string; agent_id: string; created_at: string }[]>();
  if (error) return { ok: false };

  const nameByAgent = await resolveAgentNames(supabase, [...new Set((data ?? []).map((l) => l.agent_id))]);
  return { ok: true, data: (data ?? []).map((l) => ({ id: l.id, title: l.title, agentName: nameByAgent.get(l.agent_id)?.trim() || l.agent_id.slice(0, 8), createdAt: l.created_at, status: "pending_review" })) };
}

export async function getPublishedAndSuspendedListings(): Promise<Part<ListingModerationRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, agent_id, created_at, status")
    .in("status", ["published", "suspended"])
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; title: string; agent_id: string; created_at: string; status: "published" | "suspended" }[]>();
  if (error) return { ok: false };

  const nameByAgent = await resolveAgentNames(supabase, [...new Set((data ?? []).map((l) => l.agent_id))]);
  return { ok: true, data: (data ?? []).map((l) => ({ id: l.id, title: l.title, agentName: nameByAgent.get(l.agent_id)?.trim() || l.agent_id.slice(0, 8), createdAt: l.created_at, status: l.status })) };
}

/** CHECK constraint listing_leads.status (0114) — 'new'/'contacted'/'converted'/'lost'. Tabel TIDAK punya kolom kontak prospek sama sekali (murni log klik CTA WhatsApp, 0047). */
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type LeadRow = { id: string; listingTitle: string; agentName: string; source: string; status: LeadStatus; createdAt: string };

export async function getAllLeads(): Promise<Part<LeadRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_leads")
    .select("id, source, status, created_at, listing_id, agent_id, listings(title)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; source: string; status: LeadStatus; created_at: string; listing_id: string; agent_id: string; listings: { title: string } | null }[]>();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const nameByAgent = await resolveAgentNames(supabase, [...new Set(data.map((l) => l.agent_id))]);
  return {
    ok: true,
    data: data.map((l) => ({
      id: l.id,
      listingTitle: l.listings?.title ?? "—",
      agentName: nameByAgent.get(l.agent_id)?.trim() || l.agent_id.slice(0, 8),
      source: l.source,
      status: l.status,
      createdAt: l.created_at,
    })),
  };
}
