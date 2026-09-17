// app/api/developer-projects/[id]/claim/route.ts
// API-118 POST /developer-projects/{id}/claim — Agent mengklaim project
// developer (prasyarat sebelum Project bisa jadi Listing miliknya, lihat
// listings.developer_project_id & catatan di 0034/0035). Otorisasi lewat RLS
// agent_project_claims_insert (0035: `agent_id = auth.uid()`) — mencegah
// klaim atas nama agent lain. UNIQUE(agent_id, project_id) di DB (0035)
// mencegah klaim duplikat — surfaced sebagai error constraint biasa kalau
// terjadi (bukan divalidasi manual di sini, R-02).
//
// HANYA aksi "create" yang evidenced (STEP11-B3 F11-B3-007) — withdraw/
// review/approve/reject/revoke SENGAJA tidak ada route terpisah di batch ini
// ("no invented lifecycle routes").

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengklaim developer project.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_project_claims")
    .insert({ agent_id: ctx.userId, project_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Anda sudah pernah mengklaim project ini.");
    }
    throw error;
  }

  return { data, status: 201 };
});
