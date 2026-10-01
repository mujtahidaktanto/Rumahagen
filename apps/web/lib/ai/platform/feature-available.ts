// lib/ai/platform/feature-available.ts — apakah tombol AI boleh tampil di form, dicek dari
// SERVER COMPONENT (page.tsx) lewat RPC ai_feature_available (migration 0174/0175, SECURITY
// DEFINER). CLAUDE.md melarang panggilan Supabase langsung dari kode BROWSER -- helper ini hanya
// dipakai di page.tsx (server), hasilnya diteruskan ke komponen klien sebagai prop boolean biasa.
import { createClient } from "@/lib/supabase/server";

export type AiAvailability = { description: boolean; metaSeo: boolean };

/** descriptionFeature: "listing_description" untuk /agent/listing/*, "project_description" untuk /partner/proyek/*. */
export async function getAiAvailability(descriptionFeature: "listing_description" | "project_description"): Promise<AiAvailability> {
  const supabase = await createClient();
  const [d, m] = await Promise.all([supabase.rpc("ai_feature_available", { p_feature: descriptionFeature }), supabase.rpc("ai_feature_available", { p_feature: "meta_seo" })]);
  return { description: d.data === true, metaSeo: m.data === true };
}
