// app/api/awarding-paths/[id]/status/route.ts
// API-209 PATCH /awarding-paths/{path_id}/status (authorized authority).
// `awarding_paths.status` TIDAK ADA CHECK constraint di DB (0064) — endpoint
// ini murni transisi field TEXT bebas, konsisten dengan keputusan migration
// untuk tidak mengunci vocabulary yang tidak dievidence.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { awardingPathStatusSchema } from "@/lib/validation/awarding-paths";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, awardingPathStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_paths")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding path tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
