// app/api/auth/verify-otp/route.ts
// M01 STEP11-B1 API-002. Verifikasi kode OTP 6 digit yang dikirim saat
// register -> Supabase set auth.users.email_confirmed_at, trigger migration
// 0096 menyinkronkan public.users.email_verified_at otomatis, dan sesi
// (access/refresh token) langsung terbentuk -- tidak ada gate pending
// review terpisah (migration 0083: begitu OTP sesuai, akun langsung ACTIVE).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { verifyOtpSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, verifyOtpSchema);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: body.email,
    token: body.token,
    type: "signup",
  });

  if (error) mapAuthError(error);

  return {
    data: {
      user_id: data.user?.id ?? null,
      access_token: data.session?.access_token ?? null,
      refresh_token: data.session?.refresh_token ?? null,
      expires_at: data.session?.expires_at ?? null,
    },
  };
});
