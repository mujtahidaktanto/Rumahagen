// lib/public/project-data.ts — data Developer / Proyek publik (M11 Discovery tab Developer dan Detail-Developer-Project), dibaca di server dengan RLS pemanggil.
// Pengunjung melihat proyek berstatus active | coming_soon | sold_out milik developer partner `active` (developer_projects_select); `inactive` tidak terlihat.
// KOMISI (commission_scheme, extra_commission) TIDAK PERNAH dibaca untuk pengunjung/peran lain: hanya Agent yang login melihat "Info Kemitraan Agen" (wireframe), lewat
// getProjectPartnership(). Catatan keamanan: RLS mengizinkan anon membaca kolom komisi lewat REST langsung (lihat audit/FRONTEND_GAPS.md); halaman ini hanya tidak menampilkannya.
// developer_projects tidak punya kolom deskripsi; meta_description dipakai sebagai deskripsi bila ada.
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_TYPES, type PropertyType } from "./listing-params";

export const PROJECT_STATUSES = ["active", "coming_soon", "sold_out"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABEL: Record<string, string> = { active: "Tersedia", coming_soon: "Segera Hadir", sold_out: "Unit Habis Terjual", inactive: "Proyek Tidak Aktif" };
export const CLAIM_STATUS_LABEL: Record<string, string> = { pending: "Menunggu peninjauan", approved: "Disetujui", rejected: "Ditolak", revoked: "Dicabut", withdrawn: "Ditarik" };

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  transaction_type: "sale" | "rent";
  property_type: string;
  location: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  unit_availability: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area: number | null;
  land_area: number | null;
  status: string;
  developerName: string | null;
  coverUrl: string | null;
};

type SummaryRow = Omit<ProjectSummary, "developerName" | "coverUrl"> & {
  developer: { company_name: string } | null;
  media: { type: string; url: string; created_at: string }[] | null;
};

const SUMMARY_SELECT =
  "id, slug, name, category, transaction_type, property_type, location, price_min, price_max, price_unit, unit_availability, bedrooms, bathrooms, building_area, land_area, status, developer:developer_partners(company_name), media:developer_project_media(type, url, created_at)";

function toSummary({ developer, media, ...rest }: SummaryRow): ProjectSummary {
  const photo = [...(media ?? [])].filter((m) => m.type === "photo").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  return { ...rest, developerName: developer?.company_name ?? null, coverUrl: photo?.url ?? null };
}

export const PROJECT_PAGE_SIZE = 12;
export const PROJECT_MAX_SHOWN = 96;
export type ProjectSearch = { q: string; jenis: PropertyType | null; status: ProjectStatus | null; tampil: number };

export function parseProjectSearch(raw: Record<string, string | string[] | undefined>): ProjectSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const j = one(raw.jenis);
  const st = one(raw.status);
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= PROJECT_PAGE_SIZE && t <= PROJECT_MAX_SHOWN ? Math.ceil(t / PROJECT_PAGE_SIZE) * PROJECT_PAGE_SIZE : PROJECT_PAGE_SIZE;
  return {
    q: (one(raw.q) ?? "").trim().slice(0, 100),
    jenis: (PROPERTY_TYPES as readonly string[]).includes(j ?? "") ? (j as PropertyType) : null,
    status: (PROJECT_STATUSES as readonly string[]).includes(st ?? "") ? (st as ProjectStatus) : null,
    tampil,
  };
}

export function projectQuery(s: ProjectSearch, patch: Partial<ProjectSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.jenis) p.set("jenis", v.jenis);
  if (v.status) p.set("status", v.status);
  if (v.tampil !== PROJECT_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type ProjectSearchResult = { ok: true; items: ProjectSummary[]; total: number } | { ok: false; items: []; total: 0 };

export async function searchProjects(s: ProjectSearch): Promise<ProjectSearchResult> {
  const supabase = await createClient();
  let query = supabase
    .from("developer_projects")
    .select(SUMMARY_SELECT, { count: "exact" })
    .in("status", s.status ? [s.status] : [...PROJECT_STATUSES])
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, s.tampil - 1);
  if (s.jenis) query = query.eq("property_type", s.jenis);
  const kw = s.q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`name.ilike.%${kw}%,location.ilike.%${kw}%,area_keyword.ilike.%${kw}%`);
  const { data, count, error } = await query.returns<SummaryRow[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: (data ?? []).map(toSummary), total: count ?? 0 };
}

export type ProjectDetail = {
  id: string;
  slug: string;
  name: string;
  meta_title: string | null;
  meta_description: string | null;
  category: string;
  transaction_type: "sale" | "rent";
  property_type: string;
  location: string | null;
  cityName: string | null;
  provinceName: string | null;
  districtName: string | null;
  latitude: number | null;
  longitude: number | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  is_negotiable: boolean | null;
  unit_availability: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  land_area: number | null;
  building_area: number | null;
  floors: number | null;
  carport_capacity: number | null;
  electrical_power: number | null;
  water_source: string | null;
  furnishing: string | null;
  year_built: number | null;
  certificate_type: string | null;
  certificate_transferred: boolean | null;
  imb_status: string | null;
  dispute_free_declared: boolean | null;
  status: string;
  photos: { url: string; alt: string | null }[];
  videos: string[];
  developer: { id: string; company_name: string; company_logo: string | null; description: string | null; pic_name: string | null; pic_contact: string | null } | null;
};

type DetailRow = Omit<ProjectDetail, "cityName" | "provinceName" | "districtName" | "photos" | "videos" | "developer"> & {
  city: { name: string } | null;
  province: { name: string } | null;
  district: { name: string } | null;
  media: { type: string; url: string; created_at: string }[] | null;
  developer: ProjectDetail["developer"];
};

// Kolom komisi SENGAJA tidak ada di sini.
const DETAIL_SELECT =
  "id, slug, name, meta_title, meta_description, category, transaction_type, property_type, location, latitude, longitude, price_min, price_max, price_unit, is_negotiable, unit_availability, bedrooms, bathrooms, land_area, building_area, floors, carport_capacity, electrical_power, water_source, furnishing, year_built, certificate_type, certificate_transferred, imb_status, dispute_free_declared, status, city:ref_cities(name), province:ref_provinces(name), district:ref_districts(name), media:developer_project_media(type, url, created_at), developer:developer_partners(id, company_name, company_logo, description, pic_name, pic_contact)";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProjectDetailResult = { state: "ok"; project: ProjectDetail } | { state: "not_found" } | { state: "error" };

export async function getProjectDetail(slug: string): Promise<ProjectDetailResult> {
  if (!SLUG.test(slug)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("developer_projects").select(DETAIL_SELECT).eq("slug", slug).maybeSingle<DetailRow>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };
  const { city, province, district, media, ...rest } = data;
  const sorted = [...(media ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return {
    state: "ok",
    project: {
      ...rest,
      cityName: city?.name ?? null,
      provinceName: province?.name ?? null,
      districtName: district?.name ?? null,
      photos: sorted.filter((m) => m.type === "photo").map((m) => ({ url: m.url, alt: null })),
      videos: sorted.filter((m) => m.type === "video").map((m) => m.url),
    },
  };
}

export type Partnership = { commission_scheme: string | null; extra_commission: string | null; claimStatus: string | null };

/** Info Kemitraan Agen: hanya dipanggil untuk Agent yang login. Mengembalikan skema komisi dan status klaim milik agen itu (RLS agent_project_claims: baris sendiri). */
export async function getProjectPartnership(projectId: string, agentId: string): Promise<Partnership | null> {
  const supabase = await createClient();
  const [proj, claim] = await Promise.all([
    supabase.from("developer_projects").select("commission_scheme, extra_commission").eq("id", projectId).maybeSingle<{ commission_scheme: string | null; extra_commission: string | null }>(),
    supabase.from("agent_project_claims").select("status").eq("project_id", projectId).eq("agent_id", agentId).order("claimed_at", { ascending: false }).limit(1),
  ]);
  if (proj.error || !proj.data) return null;
  return { commission_scheme: proj.data.commission_scheme, extra_commission: proj.data.extra_commission, claimStatus: claim.data?.[0]?.status ?? null };
}
