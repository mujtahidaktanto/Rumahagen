// app/api/auth/refresh/route.ts
// M01 STEP11-B1 API-006. Tukar refresh_token lama dengan sesi baru.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { refreshSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, refreshSchema);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: body.refresh_token,
  });

  if (error) mapAuthError(error);

  return {
    data: {
      access_token: data.session?.access_token ?? null,
      refresh_token: data.session?.refresh_token ?? null,
      expires_at: data.session?.expires_at ?? null,
    },
  };
});
