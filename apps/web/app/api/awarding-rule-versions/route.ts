// app/api/awarding-rule-versions/route.ts
// API-214 POST /awarding-rule-versions (authorized rule authority). TIDAK ADA
// GET list di sini — tidak dievidence di STEP11-B8 (hanya GET detail by id,
// API-213). Rule version ditemukan lewat id yang sudah diketahui klien
// (mis. dari alur konfigurasi path/rule yang dilakukan staff internal).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAwardingRuleVersionSchema } from "@/lib/validation/awarding-rule-versions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAwardingRuleVersionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_rule_versions")
    .insert(body)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Version_no ini sudah dipakai untuk rule_code yang sama.");
    }
    throw error;
  }

  return { data, status: 201 };
});
