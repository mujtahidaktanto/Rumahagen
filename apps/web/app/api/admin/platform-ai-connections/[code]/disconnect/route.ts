// app/api/admin/platform-ai-connections/[code]/disconnect/route.ts
// POST -- kosongkan key (tandai status='disabled', BUKAN hapus baris supaya connected_by/riwayat
// tetap tertelusuri). Fitur yang memakai provider ini sebagai utama pindah ke cadangan (atau
// dinonaktifkan bila tidak ada cadangan); yang memakainya sebagai cadangan cukup dikosongkan.
// Superadmin-only.
import { withApiHandler } from "@/lib/api/handler";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { demoteFeatureModel, loadPlatformProvider } from "@/lib/admin/platform-ai-connect";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);
  const provider = await loadPlatformProvider(supabase, ctx.params.code ?? "");

  const { data: conn, error } = await supabase
    .from("platform_ai_connections")
    .update({ encrypted_api_key: null, key_last4: null, status: "disabled", updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq("provider_id", provider.id)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!conn) throw new ApiError("NOT_FOUND", "Koneksi provider ini belum pernah dibuat.");

  await demoteFeatureModel(supabase, provider.id, ctx.userId);

  await logAuditEvent(ctx.userId, { p_action: "platform_ai.disconnect", p_entity_type: "platform_ai_connection", p_entity_id: conn.id, p_new_value: { provider_code: provider.code } });

  return { data: { ok: true } };
});
