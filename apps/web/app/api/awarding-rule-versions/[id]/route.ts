// app/api/awarding-rule-versions/[id]/route.ts
// API-213 GET /awarding-rule-versions/{rule_version_id} (authorized/scoped),
// API-215 PUT /awarding-rule-versions/{rule_version_id} (authorized rule
// authority). Otorisasi lewat RLS awarding_rule_versions_manage (0065).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateAwardingRuleVersionSchema } from "@/lib/validation/awarding-rule-versions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awarding_rule_versions")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding rule version tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateAwardingRuleVersionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_rule_versions")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Awarding rule version tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
