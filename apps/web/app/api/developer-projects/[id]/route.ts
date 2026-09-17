// app/api/developer-projects/[id]/route.ts
// API-117 GET /developer-projects/{id} — Project detail; hanya field kontrak
// current/authorized yang terekspos (di sini: seluruh kolom, RLS yang
// menentukan boleh/tidaknya baris ini terlihat sama sekali — pola sama
// seperti listings/events).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_projects")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer project tidak ditemukan.");
  }

  return { data };
});
