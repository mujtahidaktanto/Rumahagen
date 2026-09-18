// app/api/auth/oauth/google/route.ts
// M01 STEP11-B1 API-005. Tidak ada frontend browser di repo ini yang bisa
// menerima redirect langsung dari route JSON -- endpoint ini mengembalikan
// URL otorisasi Google untuk DI-REDIRECT oleh client (app.auth.oauth.google
// -> { url }), bukan melakukan redirect Response sendiri. @supabase/ssr
// (createClient di lib/supabase/server.ts) pakai flowType PKCE secara
// default, jadi code_verifier disimpan di cookie domain ini -- redirectTo
// HARUS balik ke /api/auth/callback (route ini juga, lihat file itu) supaya
// penukaran code->session bisa baca cookie yang sama, baru diteruskan ke
// redirect_to akhir yang diminta caller.
//
// DEPENDENSI EKSTERNAL YANG BELUM BISA DISELESAIKAN DARI SINI: provider
// Google harus diaktifkan di Supabase Dashboard > Authentication > Providers
// dengan Client ID/Secret dari Google Cloud Console, dan
// `{SUPABASE_URL}/api/auth/callback` (origin app ini) didaftarkan sebagai
// authorized redirect URI di kedua sisi -- sama seperti SMTP Resend yang
// butuh konfigurasi dashboard manual sebelumnya.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { oauthGoogleSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, oauthGoogleSchema);

  const origin = new URL(ctx.request.url).origin;
  const callbackUrl = new URL("/api/auth/callback", origin);
  if (body.redirect_to) callbackUrl.searchParams.set("redirect_to", body.redirect_to);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error) mapAuthError(error);

  return { data: { url: data.url } };
});
