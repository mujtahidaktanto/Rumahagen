// app/api/auth/resend-otp/route.ts
// M01 STEP11-B1 API-003. Minta ulang OTP signup -- Supabase sendiri
// menegakkan cooldown 60 detik/user (lihat rate-limit Supabase Auth yang
// dicatat di supabase/migrations/README.md), jadi tidak perlu diulang di
// sini (R-02: satu sumber batasan, bukan duplikasi).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { resendOtpSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, resendOtpSchema);

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: body.email });

  if (error) mapAuthError(error);

  return { data: { otp_sent: true } };
});
