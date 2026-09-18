// app/api/auth/reset-password/route.ts
// M01 STEP11-B1 API-010. Selesaikan reset password.
//
// Dikoreksi setelah tes langsung (bukan asumsi): rancangan awal menerima
// access_token+refresh_token di body, TERNYATA tidak cocok dengan alur
// nyatanya -- @supabase/ssr default flowType PKCE, jadi tautan di email
// reset (dikirim oleh /auth/forgot-password) mengarah ke
// /api/auth/callback?code=... (bukan token di URL fragment). Callback route
// itu (app/api/auth/callback/route.ts, dipakai bareng OAuth) sudah menukar
// code->sesi dan MEMASANG cookie sesi recovery sebelum user sampai di
// endpoint ini -- jadi endpoint ini tinggal mengandalkan sesi cookie yang
// sudah ada (pola sama seperti /auth/logout), bukan menerima token manual.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, resetPasswordSchema);

  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Sesi reset password tidak ditemukan/kedaluwarsa.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: body.new_password });
  if (error) mapAuthError(error);

  return { data: { password_reset: true } };
});
