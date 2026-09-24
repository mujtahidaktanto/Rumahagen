// app/api/agents/[id]/route.ts
// API-014 GET /agents/{slug|user_id} — profil publik Agent (STEP11-B1). Sejak migration 0148 parameter adalah `public_slug` atau `user_id` dan data dibaca dari view
// `public_agent_profiles`: hanya kolom yang boleh publik (nama, foto, bio, spesialisasi, area, kantor, lisensi, WhatsApp, provinsi/kota, NAMA organisasi,
// jumlah listing aktif/terjual/tersewa, title utama + tambahan). email, ktp_requirement_state, timestamp, dan organization_id tidak pernah keluar (user_id boleh).
// Profil private tidak tampil sama sekali (404).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { agentLookup } from "@/lib/api/agent-key";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const key = agentLookup(ctx.params.id);
  const { data, error } = await supabase.from("public_agent_profiles").select("*").eq(key.column, key.value).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Profil agent tidak ditemukan atau tidak publik.");
  }

  return { data };
});
