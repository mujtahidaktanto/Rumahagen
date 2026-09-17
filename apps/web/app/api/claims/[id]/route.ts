// app/api/claims/[id]/route.ts
// GET satu klaim, PUT transisi status (approve/reject/revoke oleh Developer
// Partner pemilik project atau staf; withdraw oleh Agent pemilik klaim —
// keduanya lewat has_permission scope 'own' pada permission
// m06.claim.review/approve/reject/revoke, 0009/0035). Trigger
// trg_project_claim_review_stamp (0035) otomatis mengisi reviewed_by/
// reviewed_at — tidak diduplikasi di sini (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { claimStatusSchema } from "@/lib/validation/claims";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_project_claims")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Claim tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, claimStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_project_claims")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Claim tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
