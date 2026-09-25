// app/api/organizations/route.ts
// POST /organizations — API-156 (M12, STEP11-B6 §8, agen/user gap).
// "Eligible Agent creates an Organization and becomes Lead" -- otorisasi
// sepenuhnya lewat RLS organizations_manage (created_by=auth.uid() OR
// staf, 0007) -- R-02, tidak diduplikasi di sini. Trigger
// create_organization_leader_membership (0110) otomatis menambahkan
// pembuat sebagai baris organization_members role='leader' status='active'
// dalam transaksi INSERT yang sama.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createOrganizationSchema } from "@/lib/validation/organizations";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`.slice(0, 170);
}

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat organisasi.");
  }

  const body = await validateJsonBody(ctx.request, createOrganizationSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      ...body,
      slug: body.slug ?? slugify(body.organization_name),
      created_by: ctx.userId,
    })
    .select()
    .single();

  if (error) throw error;

  await logAuditEvent(ctx.userId, {
    p_action: "m12.organization.create",
    p_entity_type: "organizations",
    p_entity_id: data.id,
    p_organization_id: data.id,
    p_new_value: { organization_name: data.organization_name, organization_type: data.organization_type },
  });

  return { data, status: 201 };
});
