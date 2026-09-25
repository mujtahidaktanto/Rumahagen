// lib/public/agent-data.ts — data halaman Agen publik (M11 Daftar Agen dan Detail Agen), dibaca di server dari view `public_agent_profiles` (0148/0149): hanya profil berstatus
// public dan akun aktif; kolom sensitif (email, KTP, organization_id, timestamp) memang tidak ada di view. Agen berprofil privat = sama dengan tidak ada (tidak dibedakan).
import { createClient } from "@/lib/supabase/server";
import { LISTING_CARD_SELECT, toFeaturedListing, type FeaturedListing, type ListingCardRow } from "./home-data";

export type AgentTitle = { code: string; name: string; description: string | null; issued_at: string | null };

export type PublicAgent = {
  user_id: string;
  public_slug: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialization: string[] | null;
  coverage_area: string | null;
  office_name: string | null;
  license_number: string | null;
  whatsapp_number: string | null;
  public_cta_enabled: boolean;
  is_verified: boolean;
  province_name: string | null;
  city_name: string | null;
  organization_name: string | null;
  active_listings_count: number;
  total_listings_sold: number;
  total_listings_rented: number;
  primary_title: AgentTitle | null;
  additional_titles: AgentTitle[] | null;
};

const AGENT_SELECT =
  "user_id, public_slug, full_name, avatar_url, bio, specialization, coverage_area, office_name, license_number, whatsapp_number, public_cta_enabled, is_verified, province_name, city_name, organization_name, active_listings_count, total_listings_sold, total_listings_rented, primary_title, additional_titles";

export type AgentResult = { state: "ok"; agent: PublicAgent; listings: FeaturedListing[]; listingsOk: boolean } | { state: "not_found" } | { state: "error" };

export async function getAgentBySlug(slug: string): Promise<AgentResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("public_agent_profiles").select(AGENT_SELECT).eq("public_slug", slug).maybeSingle<PublicAgent>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  // Portofolio pelengkap: gagal memuat tidak menjatuhkan profil (ditandai listingsOk=false).
  const { data: rows, error: listErr } = await supabase
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("agent_id", data.user_id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("freshness_rank_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(12)
    .returns<ListingCardRow[]>();
  return { state: "ok", agent: data, listings: (rows ?? []).map(toFeaturedListing), listingsOk: !listErr };
}

export const AGENT_PAGE_SIZE = 12;
export const AGENT_MAX_SHOWN = 96;

export type AgentSearch = { q: string; urut: "nama" | "listing"; tampil: number };

export function parseAgentSearch(raw: Record<string, string | string[] | undefined>): AgentSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= AGENT_PAGE_SIZE && t <= AGENT_MAX_SHOWN ? Math.ceil(t / AGENT_PAGE_SIZE) * AGENT_PAGE_SIZE : AGENT_PAGE_SIZE;
  return { q: (one(raw.q) ?? "").trim().slice(0, 100), urut: one(raw.urut) === "nama" ? "nama" : "listing", tampil };
}

export function agentQuery(s: AgentSearch, patch: Partial<AgentSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.urut !== "listing") p.set("urut", v.urut);
  if (v.tampil !== AGENT_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type AgentSearchResult = { ok: true; items: PublicAgent[]; total: number } | { ok: false; items: []; total: 0 };

export async function searchAgents(s: AgentSearch): Promise<AgentSearchResult> {
  const supabase = await createClient();
  let query = supabase.from("public_agent_profiles").select(AGENT_SELECT, { count: "exact" });
  // Buang karakter khusus filter .or() PostgREST dan pola ilike.
  const kw = s.q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`full_name.ilike.%${kw}%,city_name.ilike.%${kw}%,province_name.ilike.%${kw}%,office_name.ilike.%${kw}%,coverage_area.ilike.%${kw}%`);
  query = s.urut === "nama" ? query.order("full_name", { ascending: true }) : query.order("active_listings_count", { ascending: false }).order("full_name", { ascending: true });
  query = query.order("user_id", { ascending: true }).range(0, s.tampil - 1);
  const { data, count, error } = await query.returns<PublicAgent[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: data ?? [], total: count ?? 0 };
}
