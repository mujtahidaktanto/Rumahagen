// app/api/organizations/[id]/dashboard/route.ts
// GET /organizations/{id}/dashboard — API-160 (M12, STEP11-B6 §8). "Lead
// and active Member visibility is governed by M10 authorization plus M12
// context/state" -- member-only (bukan publik seperti search), tidak ada
// field/isi yang dievidensi Core selain nama endpoint (dicek menyeluruh) --
// keputusan rekayasa: agregat ringkas (detail organisasi + jumlah member
// aktif + jumlah undangan pending) yang sudah tersedia dari tabel yang
// ada, tanpa tabel/kolom baru. `pending_invitations_count` HANYA
// ditampilkan untuk leader/staf (member biasa tidak berhak lihat daftar
// undangan lewat organization_invitations_select yang sudah ada).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: isMember, error: memberErr } = await supabase.rpc("is_org_member", { p_organization_id: ctx.params.id });
  if (memberErr) throw memberErr;
  if (!isMember) {
    throw new ApiError("FORBIDDEN", "Hanya member aktif atau staf yang bisa melihat dashboard organisasi ini.");
  }

  const { data: org, error: orgErr } = await supabase.from("organizations").select("*").eq("id", ctx.params.id).maybeSingle();
  if (orgErr) throw orgErr;
  if (!org) {
    throw new ApiError("NOT_FOUND", "Organisasi tidak ditemukan.");
  }

  const { count: activeMemberCount, error: countErr } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", ctx.params.id)
    .eq("status", "active");
  if (countErr) throw countErr;

  const { data: isLeader, error: leaderErr } = await supabase.rpc("is_org_leader", { p_organization_id: ctx.params.id });
  if (leaderErr) throw leaderErr;

  let pendingInvitationsCount: number | undefined;
  if (isLeader) {
    const { count, error: invErr } = await supabase
      .from("organization_invitations")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", ctx.params.id)
      .eq("status", "pending");
    if (invErr) throw invErr;
    pendingInvitationsCount = count ?? 0;
  }

  return {
    data: {
      organization: org,
      active_member_count: activeMemberCount ?? 0,
      ...(pendingInvitationsCount !== undefined ? { pending_invitations_count: pendingInvitationsCount } : {}),
    },
  };
});
