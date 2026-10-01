// lib/partner/profile-data.ts — data Profil Developer (M06, wireframe 03-Developer-Partner/M06-Profil-Developer). Baris developer_partners milik akun login
// (GET /developer-partners?mine=true setara — dibaca langsung di server, pola sama seperti modul lain). null = akun belum dihubungkan staf ke perusahaan mana pun.
// Berkas legalitas (migration 0172) dan riwayat perumahan (0172) dibaca terpisah di sini juga — keduanya sudah digerbangi RLS (developer_legal_documents_manage/
// developer_project_history_select), jadi aman dibaca langsung lewat sesi pengguna tanpa pengecekan tambahan di lapisan ini.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import { withDeveloperLegalDocDownloadUrls } from "@/lib/storage/developer-legal-docs";

export type MyPartnerProfile = {
  id: string;
  companyName: string;
  companyLogo: string | null;
  description: string | null;
  picName: string | null;
  picContact: string | null;
  status: string;
};

export async function getMyPartnerProfile(userId: string): Promise<Part<MyPartnerProfile | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .select("id, company_name, company_logo, description, pic_name, pic_contact, status")
    .eq("user_id", userId)
    .maybeSingle<{ id: string; company_name: string; company_logo: string | null; description: string | null; pic_name: string | null; pic_contact: string | null; status: string }>();
  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  return {
    ok: true,
    data: {
      id: data.id,
      companyName: data.company_name,
      companyLogo: data.company_logo,
      description: data.description,
      picName: data.pic_name,
      picContact: data.pic_contact,
      status: data.status,
    },
  };
}

export type LegalDocumentRow = { id: string; documentName: string; fileUrl: string; downloadUrl: string | null; createdAt: string };

export async function getDeveloperLegalDocuments(developerId: string): Promise<Part<LegalDocumentRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_legal_documents")
    .select("id, document_name, file_url, created_at")
    .eq("developer_id", developerId)
    .order("created_at", { ascending: false })
    .returns<{ id: string; document_name: string; file_url: string; created_at: string }[]>();
  if (error) return { ok: false };
  const withUrls = await withDeveloperLegalDocDownloadUrls(data ?? []);
  return { ok: true, data: withUrls.map((d) => ({ id: d.id, documentName: d.document_name, fileUrl: d.file_url, downloadUrl: d.download_url, createdAt: d.created_at })) };
}

export type ProjectHistoryRow = { id: string; projectName: string; logoUrl: string | null; displayOrder: number; createdAt: string };

export async function getDeveloperProjectHistory(developerId: string): Promise<Part<ProjectHistoryRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_history")
    .select("id, project_name, logo_url, display_order, created_at")
    .eq("developer_id", developerId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<{ id: string; project_name: string; logo_url: string | null; display_order: number; created_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((h) => ({ id: h.id, projectName: h.project_name, logoUrl: h.logo_url, displayOrder: h.display_order, createdAt: h.created_at })) };
}
