// lib/public/organization-data.ts — data Organisasi publik (M11 Discovery tab Organisasi dan Detail-Organisasi), dibaca di server dengan RLS anon: hanya organisasi berstatus `active`
// (organizations_select_active_public). Karena itu organisasi yang sedang ditutup bertahap/ditutup/dibekukan tidak terlihat publik ("tidak ditemukan"), sama seperti listing dan promo.
// Anggota tim: tabel organization_members hanya terbaca anggota/admin, jadi anggota publik diambil dari view `public_agent_profiles` yang `organization_id`-nya sama
// (kolom ditambah migration 0156; profil publik + organisasi aktif). Dicocokkan lewat ID (bukan nama, karena nama organisasi tidak unik).
// Peran (leader/member) tidak tersedia di view, jadi tidak ditampilkan.
import { createClient } from "@/lib/supabase/server";
import { LISTING_CARD_SELECT, toFeaturedListing, type FeaturedListing, type ListingCardRow } from "./home-data";
import { safeHref } from "./promo-data";
import { AGENT_SELECT, type PublicAgent } from "./agent-data";

export { ORG_TYPES, ORG_TYPE_LABEL, type OrgType } from "./organization-labels";
import { ORG_TYPES, type OrgType } from "./organization-labels";

export type PublicOrganization = {
  id: string;
  organization_name: string;
  slug: string;
  organization_type: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  website: string | null;
  social_media: Record<string, unknown> | null;
  address: string | null;
  contact_phone: string | null;
};

const ORG_SELECT = "id, organization_name, slug, organization_type, logo_url, banner_url, description, website, social_media, address, contact_phone";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ORG_PAGE_SIZE = 12;
export const ORG_MAX_SHOWN = 96;
export type OrgSearch = { jenis: OrgType | null; q: string; tampil: number };

export function parseOrgSearch(raw: Record<string, string | string[] | undefined>): OrgSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const j = one(raw.jenis);
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= ORG_PAGE_SIZE && t <= ORG_MAX_SHOWN ? Math.ceil(t / ORG_PAGE_SIZE) * ORG_PAGE_SIZE : ORG_PAGE_SIZE;
  return { jenis: (ORG_TYPES as readonly string[]).includes(j ?? "") ? (j as OrgType) : null, q: (one(raw.q) ?? "").trim().slice(0, 100), tampil };
}

export function orgQuery(s: OrgSearch, patch: Partial<OrgSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.jenis) p.set("jenis", v.jenis);
  if (v.tampil !== ORG_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type OrgSearchResult = { ok: true; items: PublicOrganization[]; total: number } | { ok: false; items: []; total: 0 };

export async function searchOrganizations(s: OrgSearch): Promise<OrgSearchResult> {
  const supabase = await createClient();
  let query = supabase.from("organizations").select(ORG_SELECT, { count: "exact" }).eq("status", "active").is("deleted_at", null).order("organization_name", { ascending: true }).order("id", { ascending: true }).range(0, s.tampil - 1);
  if (s.jenis) query = query.eq("organization_type", s.jenis);
  const kw = s.q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`organization_name.ilike.%${kw}%,address.ilike.%${kw}%,description.ilike.%${kw}%`);
  const { data, count, error } = await query.returns<PublicOrganization[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: data ?? [], total: count ?? 0 };
}

export type OrgDetailResult =
  | { state: "ok"; org: PublicOrganization; members: PublicAgent[]; membersOk: boolean; listings: FeaturedListing[]; listingsOk: boolean }
  | { state: "not_found" }
  | { state: "error" };

export async function getOrganizationBySlug(slug: string): Promise<OrgDetailResult> {
  if (!SLUG.test(slug)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").select(ORG_SELECT).eq("slug", slug).eq("status", "active").is("deleted_at", null).maybeSingle<PublicOrganization>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  // Bagian pelengkap: gagal memuat tidak menjatuhkan halaman.
  const [membersRes, listingsRes] = await Promise.all([
    supabase
      .from("public_agent_profiles")
      .select(AGENT_SELECT)
      .eq("organization_id", data.id)
      .order("full_name", { ascending: true })
      .limit(48)
      .returns<PublicAgent[]>(),
    supabase
      .from("listings")
      .select(LISTING_CARD_SELECT)
      .eq("organization_id", data.id)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("freshness_rank_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(12)
      .returns<ListingCardRow[]>(),
  ]);
  return {
    state: "ok",
    org: data,
    members: membersRes.error ? [] : (membersRes.data ?? []),
    membersOk: !membersRes.error,
    listings: listingsRes.error ? [] : (listingsRes.data ?? []).map(toFeaturedListing),
    listingsOk: !listingsRes.error,
  };
}

/** Tautan media sosial yang aman: hanya https; kunci dikenal (instagram, facebook, tiktok, youtube, linkedin, x/twitter) diberi label. Lainnya diabaikan. */
export function socialLinks(social: Record<string, unknown> | null | undefined): { key: string; label: string; href: string }[] {
  const LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", x: "X", twitter: "X" };
  if (!social || typeof social !== "object") return [];
  const out: { key: string; label: string; href: string }[] = [];
  for (const [k, v] of Object.entries(social)) {
    const label = LABEL[k.toLowerCase()];
    if (!label || typeof v !== "string") continue;
    const href = safeHref(v);
    if (href?.startsWith("https://")) out.push({ key: k, label, href });
  }
  return out;
}
