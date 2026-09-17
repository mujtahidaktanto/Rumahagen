// app/api/awarding-path-versions/[id]/route.ts
// API-212 GET /awarding-path-versions/{path_version_id} (authorized/scoped).
// TIDAK ADA PUT/PATCH di sini — F11-B8-002 menegaskan tidak ada endpoint
// mutasi untuk versi selain create, jadi hanya GET yang dibangun.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awarding_path_versions")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding path version tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
