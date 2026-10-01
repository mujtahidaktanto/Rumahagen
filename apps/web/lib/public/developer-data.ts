// lib/public/developer-data.ts — data halaman profil publik Developer (/developer/{slug}, migration 0172). Dibaca di server dengan RLS anon: hanya perusahaan
// `status='active'` (developer_partners_select); perusahaan nonaktif -> "tidak ditemukan", sama seperti organisasi/listing/promo. Riwayat perumahan dibaca
// lewat RLS developer_project_history_select (publik untuk developer aktif). Komisi proyek TIDAK dibaca di sini (pola sama seperti project-data.ts).
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUSES, type ProjectSummary } from "./project-data";

export type PublicDeveloper = {
  id: string;
  company_name: string;
  company_logo: string | null;
  description: string | null;
  pic_name: string | null;
  pic_contact: string | null;
  slug: string;
};

export type DeveloperHistoryItem = { id: string; projectName: string; logoUrl: string | null };

const DEVELOPER_SELECT = "id, company_name, company_logo, description, pic_name, pic_contact, slug";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type DeveloperDetailResult =
  | { state: "ok"; developer: PublicDeveloper; history: DeveloperHistoryItem[]; historyOk: boolean; projects: ProjectSummary[]; projectsOk: boolean }
  | { state: "not_found" }
  | { state: "error" };

export async function getDeveloperBySlug(slug: string): Promise<DeveloperDetailResult> {
  if (!SLUG.test(slug)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("developer_partners").select(DEVELOPER_SELECT).eq("slug", slug).eq("status", "active").is("deleted_at", null).maybeSingle<PublicDeveloper>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  // Bagian pelengkap: gagal memuat tidak menjatuhkan halaman.
  const [historyRes, projectsRes] = await Promise.all([
    supabase
      .from("developer_project_history")
      .select("id, project_name, logo_url")
      .eq("developer_id", data.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .returns<{ id: string; project_name: string; logo_url: string | null }[]>(),
    supabase
      .from("developer_projects")
      .select(
        "id, slug, name, category, transaction_type, property_type, location, price_min, price_max, price_unit, unit_availability, bedrooms, bathrooms, building_area, land_area, status, developer:developer_partners(company_name), media:developer_project_media(type, url, created_at)",
      )
      .eq("developer_id", data.id)
      .in("status", [...PROJECT_STATUSES])
      .order("updated_at", { ascending: false })
      .limit(12)
      .returns<
        (Omit<ProjectSummary, "developerName" | "coverUrl"> & { developer: { company_name: string } | null; media: { type: string; url: string; created_at: string }[] | null })[]
      >(),
  ]);

  return {
    state: "ok",
    developer: data,
    history: historyRes.error ? [] : (historyRes.data ?? []).map((h) => ({ id: h.id, projectName: h.project_name, logoUrl: h.logo_url })),
    historyOk: !historyRes.error,
    projects: projectsRes.error
      ? []
      : (projectsRes.data ?? []).map(({ developer, media, ...rest }) => {
          const photo = [...(media ?? [])].filter((m) => m.type === "photo").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
          return { ...rest, developerName: developer?.company_name ?? null, coverUrl: photo?.url ?? null };
        }),
    projectsOk: !projectsRes.error,
  };
}
