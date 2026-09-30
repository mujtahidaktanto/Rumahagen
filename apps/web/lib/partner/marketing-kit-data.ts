// lib/partner/marketing-kit-data.ts — data Marketing Kit (M06, wireframe 03-Developer-Partner/M06-Marketing-Kit). marketing_kit per proyek (project_id NOT NULL, migration 0035);
// layar ini menunjukkan satu proyek pada satu waktu (pemilih Proyek), bukan daftar gabungan semua proyek. download_url = URL bertanda tangan 1 jam (bucket privat
// marketing-kits, migration 0147) lewat withKitDownloadUrls — helper yang sama dipakai API route, dipanggil langsung di server di sini (bukan memanggil API sendiri).
import { createClient } from "@/lib/supabase/server";
import { withKitDownloadUrls } from "@/lib/storage/project-files";
import type { Part } from "@/lib/agent/dashboard-data";

export type ProjectOption = { id: string; name: string };

export async function getMyProjectOptions(userId: string): Promise<ProjectOption[]> {
  const supabase = await createClient();
  const { data: partner } = await supabase.from("developer_partners").select("id").eq("user_id", userId).maybeSingle<{ id: string }>();
  if (!partner) return [];
  const { data } = await supabase.from("developer_projects").select("id, name").eq("developer_id", partner.id).order("name").returns<ProjectOption[]>();
  return data ?? [];
}

export type MarketingKitRow = { id: string; fileType: string; fileName: string; fileUrl: string; downloadUrl: string | null; createdAt: string };

export async function getMarketingKitForProject(projectId: string): Promise<Part<MarketingKitRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_kit")
    .select("id, file_type, file_name, file_url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .returns<{ id: string; file_type: string; file_name: string; file_url: string; created_at: string }[]>();
  if (error) return { ok: false };
  const withUrls = await withKitDownloadUrls(data ?? []);
  return { ok: true, data: withUrls.map((k) => ({ id: k.id, fileType: k.file_type, fileName: k.file_name, fileUrl: k.file_url, downloadUrl: k.download_url, createdAt: k.created_at })) };
}
