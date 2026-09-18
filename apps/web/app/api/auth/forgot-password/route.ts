// app/api/auth/forgot-password/route.ts
// M01 STEP11-B1 API-009. Kirim email reset password. Supabase SENGAJA tidak
// mengembalikan error kalau email tidak terdaftar (mencegah user
// enumeration) -- response sukses selalu sama terlepas email ada atau
// tidak, jangan diubah untuk "membantu" caller menebak status akun.
//
// redirectTo yang dikirim ke Supabase HARUS /api/auth/callback (route ini
// juga dipakai OAuth) karena tautan email pakai PKCE (code, bukan token di
// URL fragment) -- code hanya bisa ditukar di server ini yang memegang
// cookie code-verifier-nya. `redirect_to` dari body caller diteruskan
// sebagai query param supaya callback tahu ke mana mengarahkan user
// (halaman "set password baru") SETELAH sesi recovery terpasang -- lihat
// app/api/auth/reset-password/route.ts untuk kelanjutannya.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, forgotPasswordSchema);

  const origin = new URL(ctx.request.url).origin;
  const callbackUrl = new URL("/api/auth/callback", origin);
  if (body.redirect_to) callbackUrl.searchParams.set("redirect_to", body.redirect_to);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
    redirectTo: callbackUrl.toString(),
  });

  if (error) mapAuthError(error);

  return { data: { reset_email_sent: true } };
});
