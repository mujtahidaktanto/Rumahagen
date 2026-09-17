// app/api/ai-connections/route.ts
// POST /ai-connections (evidenced, STEP11-B10 §4 M13) — buat koneksi BYOK
// milik pemanggil sendiri. `api_key` mentah dienkripsi (lib/crypto/byok.ts)
// SEBELUM insert — TIDAK PERNAH disimpan/dikembalikan mentah, termasuk di
// response (field `encrypted_api_key` sengaja di-strip dari hasil select).
// Otorisasi lewat RLS agent_ai_connections_self_insert (0016).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAiConnectionSchema } from "@/lib/validation/ai-providers";
import { encryptApiKey } from "@/lib/crypto/byok";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat koneksi BYOK.");
  }

  const body = await validateJsonBody(ctx.request, createAiConnectionSchema);
  const encrypted_api_key = encryptApiKey(body.api_key);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_ai_connections")
    .insert({
      user_id: ctx.userId,
      provider_id: body.provider_id,
      encrypted_api_key,
    })
    .select("id, user_id, provider_id, status, disabled_by_admin, last_validated_at, connected_at, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
