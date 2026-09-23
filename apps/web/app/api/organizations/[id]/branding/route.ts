// app/api/organizations/[id]/branding/route.ts
// PUT /organizations/{id}/branding — API-158 (M12, STEP11-B6 §8). Otorisasi
// lewat RLS organizations_manage (created_by=auth.uid() OR staf, 0007) yang
// sudah ada -- creator selalu == leader (trigger 0110, tidak ada Lead
// Transfer), jadi tidak perlu pengecekan is_org_leader terpisah di sini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateOrganizationBrandingSchema } from "@/lib/validation/organizations";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateOrganizationBrandingSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("FORBIDDEN", "Organisasi tidak ditemukan atau Anda tidak punya akses untuk mengubah branding-nya.");
  }

  await supabase.rpc("log_audit_event", {
    p_action: "m12.organization.branding_update",
    p_entity_type: "organizations",
    p_entity_id: data.id,
    p_organization_id: data.id,
    p_new_value: body,
  });

  return { data };
});
