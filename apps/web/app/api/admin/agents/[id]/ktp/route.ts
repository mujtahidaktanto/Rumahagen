// app/api/admin/agents/[id]/ktp/route.ts
// GET /admin/agents/{id}/ktp — staf melihat data KTP Agent (nomor lengkap + foto lewat signed URL 10 menit) untuk pemeriksaan/dugaan penyalahgunaan.
// Otorisasi lewat RLS agent_kyc_select (m02.agent_profile.view scope all); bukan staf -> 404. Setiap akses dicatat di audit log (m02.agent.ktp_view).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { ktpSignedUrl } from "@/lib/storage/agent-ktp";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data: kyc, error } = await supabase
    .from("agent_kyc")
    .select("user_id, ktp_number, ktp_photo_path, submitted_at, updated_at")
    .eq("user_id", ctx.params.id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!kyc || kyc.user_id === ctx.userId) {
    throw new ApiError("NOT_FOUND", "Data KTP tidak ditemukan atau Anda tidak punya akses.");
  }

  await logAuditEvent(ctx.userId, { p_action: "m02.agent.ktp_view", p_entity_type: "agent_profiles", p_entity_id: kyc.user_id });

  return {
    data: {
      user_id: kyc.user_id,
      ktp_number: kyc.ktp_number,
      photo_url: await ktpSignedUrl(kyc.ktp_photo_path),
      submitted_at: kyc.submitted_at,
      updated_at: kyc.updated_at,
    },
  };
});
