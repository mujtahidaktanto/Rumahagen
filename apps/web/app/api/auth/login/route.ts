// app/api/auth/login/route.ts
// M01 STEP11-B1 API-004. Login email+password -> sesi Supabase Auth.
// users.last_login_at (kolom sudah ada sejak migration 0002, belum pernah
// ada penulisnya) di-update di sini lewat client ber-sesi (bukan admin) --
// RLS users_update_self (migration 0007) mengizinkan user meng-update baris
// dirinya sendiri.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { loginSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, loginSchema);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) mapAuthError(error);

  if (data.user) {
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);
  }

  return {
    data: {
      user_id: data.user?.id ?? null,
      access_token: data.session?.access_token ?? null,
      refresh_token: data.session?.refresh_token ?? null,
      expires_at: data.session?.expires_at ?? null,
    },
  };
});
