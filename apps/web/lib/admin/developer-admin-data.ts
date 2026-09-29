// lib/admin/developer-admin-data.ts — data Proyek Developer (M06, wireframe 02-Admin/M06-Developer-Project-Admin): tab Proyek (developer_projects, migration 0034) dan tab Developer Partner
// (developer_partners, migration 0033). Oversight staf — Developer Partner mengelola proyeknya sendiri lewat layar Proyek Saya (Fase F), tidak di sini.
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";

export type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  developerId: string;
  developerName: string;
  category: string;
  transactionType: string;
  location: string | null;
  status: string;
};

export async function getDeveloperProjects(): Promise<Part<ProjectRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_projects")
    .select("id, name, slug, developer_id, category, transaction_type, location, status, developer_partners(company_name)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; name: string; slug: string; developer_id: string; category: string; transaction_type: string; location: string | null; status: string; developer_partners: { company_name: string } | { company_name: string }[] | null }[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((p) => {
      const dp = Array.isArray(p.developer_partners) ? p.developer_partners[0] : p.developer_partners;
      return { id: p.id, name: p.name, slug: p.slug, developerId: p.developer_id, developerName: dp?.company_name ?? "—", category: p.category, transactionType: p.transaction_type, location: p.location, status: p.status };
    }),
  };
}

export type PartnerRow = { id: string; companyName: string; picName: string | null; picContact: string | null; status: string; userId: string | null; linkedEmail: string | null };

export async function getDeveloperPartners(): Promise<Part<PartnerRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .select("id, company_name, pic_name, pic_contact, status, user_id")
    .order("company_name")
    .limit(200)
    .returns<{ id: string; company_name: string; pic_name: string | null; pic_contact: string | null; status: string; user_id: string | null }[]>();
  if (error) return { ok: false };

  const linkedIds = [...new Set((data ?? []).map((p) => p.user_id).filter((v): v is string => !!v))];
  const emailById = new Map<string, string>();
  if (linkedIds.length > 0) {
    // Email hanya ada di auth.users, bukan public.users — dibaca lewat Admin API (pola sama seperti lib/admin/staff-data.ts). Akses sudah diperiksa lewat RLS developer_partners_select di atas.
    const { data: authList } = await createAdminClient().auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of authList?.users ?? []) if (u.email && linkedIds.includes(u.id)) emailById.set(u.id, u.email);
  }

  return {
    ok: true,
    data: (data ?? []).map((p) => ({ id: p.id, companyName: p.company_name, picName: p.pic_name, picContact: p.pic_contact, status: p.status, userId: p.user_id, linkedEmail: p.user_id ? (emailById.get(p.user_id) ?? "—") : null })),
  };
}
