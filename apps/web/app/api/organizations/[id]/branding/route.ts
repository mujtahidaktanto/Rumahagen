// app/api/organizations/[id]/branding/route.ts
// PUT /organizations/{id}/branding — API-158 (M12, STEP11-B6 §8). Otorisasi
// lewat RLS organizations_manage (created_by=auth.uid() OR staf, 0007) yang
// sudah ada -- creator selalu == leader (trigger 0110, tidak ada Lead
// Transfer), jadi tidak perlu pengecekan is_org_leader terpisah di sini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateOrganizationBrandingSchema } from "@/lib/validation/organizations";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { isOwnOrgMediaUrl, removeOrgMediaByUrl } from "@/lib/storage/organization-media";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateOrganizationBrandingSchema);
  const supabase = await createClient();

  // Logo/banner hanya boleh hasil unggahan ke folder organisasi ini (bukan tautan bebas); null = dihapus.
  for (const kind of ["logo", "banner"] as const) {
    const url = body[`${kind}_url`];
    if (typeof url === "string" && url && !isOwnOrgMediaUrl(url, ctx.params.id ?? "", kind)) {
      throw new ApiError("VALIDATION_ERROR", `${kind === "logo" ? "Logo" : "Banner"} harus diunggah lewat menu Edit Branding.`);
    }
  }
  const { data: before } = await supabase.from("organizations").select("logo_url, banner_url").eq("id", ctx.params.id).maybeSingle<{ logo_url: string | null; banner_url: string | null }>();

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

  // Berkas lama dihapus dari storage setelah diganti atau dilepas.
  if (before && "logo_url" in body && before.logo_url && before.logo_url !== data.logo_url) await removeOrgMediaByUrl(before.logo_url);
  if (before && "banner_url" in body && before.banner_url && before.banner_url !== data.banner_url) await removeOrgMediaByUrl(before.banner_url);

  await logAuditEvent(ctx.userId, {
    p_action: "m12.organization.branding_update",
    p_entity_type: "organizations",
    p_entity_id: data.id,
    p_organization_id: data.id,
    p_new_value: body,
  });

  return { data };
});
