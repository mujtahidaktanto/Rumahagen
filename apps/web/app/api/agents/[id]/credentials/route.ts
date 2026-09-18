// app/api/agents/[id]/credentials/route.ts
// API-015 GET /agents/{id}/credentials — Public credential/outcome
// presentation (STEP11-B1, F11-B1-011: "M02 is presentation consumer;
// upstream Learning/Qualification authority remains authoritative"). M02
// TIDAK memiliki data credential sendiri — mengambil dari title_presentations
// (M15, sudah publik untuk active=true sejak batch M15 Awarding) dan
// menyandingkan title_definitions untuk nama/deskripsi. `certificates` (M04)
// SENGAJA TIDAK disertakan — RLS certificates_select (0061) tidak punya
// jalur publik sama sekali (hanya pemilik/staf), jadi tidak ada yang bisa
// ditampilkan dari situ untuk pengunjung publik.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_presentations")
    .select("*, title_definitions(id, code, name, description)")
    .eq("user_id", ctx.params.id)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return { data: data ?? [] };
});
