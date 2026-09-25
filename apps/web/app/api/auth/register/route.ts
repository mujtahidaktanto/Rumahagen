// app/api/auth/register/route.ts
// M01 STEP11-B1 API-001. Register email+password -> Supabase Auth mengirim
// OTP verifikasi lewat SMTP Resend (lihat supabase/migrations/README.md 0096).
// Baris public.users dibuat OTOMATIS oleh trigger on_auth_user_created
// (migration 0096) -- BUKAN di sini -- supaya jalur Google OAuth (yang tidak
// pernah melewati route ini) tetap dapat baris public.users juga.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { registerSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, registerSchema);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    // Nama lengkap -> user_metadata.full_name (dibaca lib/auth/session.ts sebagai nama tampilan sebelum profil agen ada).
    options: { data: { full_name: body.full_name } },
  });

  if (error) mapAuthError(error);

  return {
    data: {
      user_id: data.user?.id ?? null,
      email: body.email,
      otp_sent: true,
    },
    status: 201,
  };
});
