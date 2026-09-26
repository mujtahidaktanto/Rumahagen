// app/api/organizations/[id]/invitations/route.ts
// API-161 POST /organizations/{id}/invitations — leader invites an agent
// (STEP11-B6). initiated_by_type='leader_invite', leader_id=ctx.userId
// (harus leader organisasi ini — ditegakkan RLS organization_invitations_
// insert via is_org_leader()).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createLeaderInviteSchema } from "@/lib/validation/organization-invitations";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const body = await validateJsonBody(ctx.request, createLeaderInviteSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({
      organization_id: ctx.params.id,
      agent_id: body.agent_id,
      leader_id: ctx.userId,
      initiated_by_type: "leader_invite",
      expires_at: body.expires_at ?? null,
    })
    .select()
    .single();

  if (error) {
    // 0161: satu pending per (organisasi, Agent, jenis); organisasi tidak aktif, sudah anggota, dsb. = 409 berpesan.
    if (error.code === "23505") throw new ApiError("CONFLICT", "Agent itu sudah diundang dan belum menjawab.");
    throwIntegrityError(error);
  }

  return { data, status: 201 };
});
