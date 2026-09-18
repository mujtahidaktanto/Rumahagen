// app/api/auth/logout/route.ts
// M01 STEP11-B1 API-007. Sign-out sesi saat ini saja (scope local) --
// berbeda dari /auth/logout-all yang mencabut SEMUA sesi user di semua
// device (scope global).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Sesi tidak ditemukan.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) mapAuthError(error);

  return { data: { logged_out: true } };
});
