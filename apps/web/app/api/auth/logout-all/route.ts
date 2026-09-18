// app/api/auth/logout-all/route.ts
// M01 STEP11-B1 API-008. Sign-out scope global -- mencabut refresh token
// user ini di SEMUA device/sesi, bukan cuma sesi yang sedang memanggil.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Sesi tidak ditemukan.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) mapAuthError(error);

  return { data: { logged_out: true } };
});
