// lib/partner/profile-data.ts — data Profil Developer (M06, wireframe 03-Developer-Partner/M06-Profil-Developer). Baris developer_partners milik akun login
// (GET /developer-partners?mine=true setara — dibaca langsung di server, pola sama seperti modul lain). null = akun belum dihubungkan staf ke perusahaan mana pun.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

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
