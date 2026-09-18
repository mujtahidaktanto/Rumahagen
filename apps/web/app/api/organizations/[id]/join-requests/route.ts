// app/api/organizations/[id]/join-requests/route.ts
// API-162 POST /organizations/{id}/join-requests — agent requests to join
// (STEP11-B6). initiated_by_type='agent_request', agent_id=ctx.userId.
// leader_id NOT NULL di skema (0050) — diresolusi server-side dari
// organization_members aktif berperan 'leader' pada organisasi ini. Lookup
// ini SENGAJA memakai admin client (bukan client sesi biasa): RLS
// organization_members_select (0007) hanya mengizinkan anggota organisasi
// yang sama melihat baris organization_members — seorang calon anggota
// yang BELUM bergabung (justru sedang mengajukan join-request) tidak akan
// pernah lolos RLS itu untuk menemukan siapa leader-nya. Mengetahui "siapa
// leader organisasi X" bukan data sensitif (bukan keputusan otorisasi),
// otorisasi SESUNGGUHNYA tetap ditegakkan RLS organization_invitations_
// insert (agent_id harus sama dengan auth.uid() untuk initiated_by_type=
// 'agent_request') saat INSERT di bawah, bukan oleh lookup ini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createJoinRequestSchema } from "@/lib/validation/organization-invitations";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const body = await validateJsonBody(ctx.request, createJoinRequestSchema);
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: leaderMember, error: leaderErr } = await admin
    .from("organization_members")
    .select("agent_id")
    .eq("organization_id", ctx.params.id)
    .eq("role", "leader")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (leaderErr) {
    throw leaderErr;
  }
  if (!leaderMember) {
    throw new ApiError("NOT_FOUND", "Organisasi tidak ditemukan atau belum punya leader aktif.");
  }

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({
      organization_id: ctx.params.id,
      agent_id: ctx.userId,
      leader_id: leaderMember.agent_id,
      initiated_by_type: "agent_request",
      expires_at: body.expires_at ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
