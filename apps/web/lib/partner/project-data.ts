// lib/partner/project-data.ts — data Proyek Saya (M06, wireframe 03-Developer-Partner/M06-{Kelola-Proyek,Detail-Proyek}). developer_projects tidak punya filter
// "milik saya" di GET /admin/developer-projects (SOURCE-Developer-Partner.md §6) — difilter di sini dengan membaca developer_id milik akun login dulu, RLS
// developer_projects_select (0034) tetap sumber otorisasi akhir (pemilik melihat SEMUA status, bukan cuma yang terlihat publik).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type MyProjectRow = { id: string; name: string; slug: string; category: string; transactionType: string; location: string | null; status: string; createdAt: string };

async function myPartnerId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("developer_partners").select("id").eq("user_id", userId).maybeSingle<{ id: string }>();
  return data?.id ?? null;
}

export async function getMyProjects(userId: string): Promise<Part<MyProjectRow[]>> {
  const partnerId = await myPartnerId(userId);
  if (!partnerId) return { ok: true, data: [] };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_projects")
    .select("id, name, slug, category, transaction_type, location, status, created_at")
    .eq("developer_id", partnerId)
    .order("created_at", { ascending: false })
    .returns<{ id: string; name: string; slug: string; category: string; transaction_type: string; location: string | null; status: string; created_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, transactionType: p.transaction_type, location: p.location, status: p.status, createdAt: p.created_at })) };
}

export type ProjectDetail = {
  id: string;
  developerId: string;
  name: string;
  slug: string;
  /** Deskripsi panjang, terpisah dari metaTitle/metaDescription (migration 0165). */
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: string;
  transactionType: string;
  propertyType: string | null;
  location: string | null;
  provinceId: string | null;
  cityId: string | null;
  districtId: string | null;
  areaKeyword: string | null;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: string | null;
  isNegotiable: boolean;
  unitAvailability: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  landArea: number | null;
  buildingArea: number | null;
  floors: number | null;
  carportCapacity: number | null;
  electricalPower: number | null;
  waterSource: string | null;
  furnishing: string | null;
  yearBuilt: number | null;
  certificateType: string | null;
  certificateTransferred: boolean;
  imbStatus: string | null;
  disputeFreeDeclared: boolean;
  commissionScheme: string | null;
  extraCommission: string | null;
  status: string;
};

export async function getMyProjectById(id: string): Promise<Part<ProjectDetail | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("developer_projects").select("*").eq("id", id).maybeSingle();
  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  const p = data as Record<string, unknown>;
  return {
    ok: true,
    data: {
      id: p.id as string,
      developerId: p.developer_id as string,
      name: p.name as string,
      slug: p.slug as string,
      description: (p.description as string) ?? null,
      metaTitle: (p.meta_title as string) ?? null,
      metaDescription: (p.meta_description as string) ?? null,
      category: p.category as string,
      transactionType: p.transaction_type as string,
      propertyType: (p.property_type as string) ?? null,
      location: (p.location as string) ?? null,
      provinceId: (p.province_id as string) ?? null,
      cityId: (p.city_id as string) ?? null,
      districtId: (p.district_id as string) ?? null,
      areaKeyword: (p.area_keyword as string) ?? null,
      priceMin: p.price_min === null ? null : Number(p.price_min),
      priceMax: p.price_max === null ? null : Number(p.price_max),
      priceUnit: (p.price_unit as string) ?? null,
      isNegotiable: !!p.is_negotiable,
      unitAvailability: p.unit_availability === null ? null : Number(p.unit_availability),
      bedrooms: p.bedrooms === null ? null : Number(p.bedrooms),
      bathrooms: p.bathrooms === null ? null : Number(p.bathrooms),
      landArea: p.land_area === null ? null : Number(p.land_area),
      buildingArea: p.building_area === null ? null : Number(p.building_area),
      floors: p.floors === null ? null : Number(p.floors),
      carportCapacity: p.carport_capacity === null ? null : Number(p.carport_capacity),
      electricalPower: p.electrical_power === null ? null : Number(p.electrical_power),
      waterSource: (p.water_source as string) ?? null,
      furnishing: (p.furnishing as string) ?? null,
      yearBuilt: p.year_built === null ? null : Number(p.year_built),
      certificateType: (p.certificate_type as string) ?? null,
      certificateTransferred: !!p.certificate_transferred,
      imbStatus: (p.imb_status as string) ?? null,
      disputeFreeDeclared: !!p.dispute_free_declared,
      commissionScheme: (p.commission_scheme as string) ?? null,
      extraCommission: (p.extra_commission as string) ?? null,
      status: p.status as string,
    },
  };
}

export type ProjectMediaRow = { id: string; type: string; url: string };

export async function getProjectMedia(projectId: string): Promise<Part<ProjectMediaRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_media")
    .select("id, type, url")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .returns<ProjectMediaRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}
