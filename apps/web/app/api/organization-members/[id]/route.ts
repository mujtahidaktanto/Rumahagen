// app/api/organization-members/[id]/route.ts
// DELETE /organization-members/{id} — API-166 (M12, STEP11-B6 §9).
// "leave/remove semantics are state/authority governed" -- SOFT, bukan
// hard delete (kolom left_at sudah ada sejak 0005): status jadi 'left'
// kalau pemanggil ADALAH member baris ini sendiri ("Leave"), atau
// 'removed' kalau leader/staf mengeluarkan member LAIN ("Forced Remove").
//
//
// Otorisasi UPDATE-nya sendiri (bukan pilihan status) sepenuhnya dari RLS
// organization_members_manage (leader/staf, 0007) ATAU
// organization_members_self_leave (member sendiri, 0110, BARU) -- trigger
// enforce_organization_member_self_leave (0110) membatasi jalur self-leave
// HANYA ke transisi active->left milik baris sendiri. Kalau leader yang
// keluar/dikeluarkan, trigger trg_org_closing_on_lead_exit (0110) otomatis
// memindahkan organizations.status ke 'closing' (Lead Exit -> CLOSING,
// LOCKED, B6 §13) -- tidak diduplikasi di sini (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data: member, error: findErr } = await supabase
    .from("organization_members")
    .select("id, organization_id, agent_id, status")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!member) {
    throw new ApiError("NOT_FOUND", "Keanggotaan tidak ditemukan atau Anda tidak punya akses.");
  }
  if (member.status !== "active") {
    throw new ApiError("CONFLICT", `Keanggotaan ini berstatus '${member.status}' -- hanya keanggotaan 'active' yang bisa keluar/dikeluarkan.`);
  }

  const isSelf = member.agent_id === ctx.userId;
  const nextStatus = isSelf ? "left" : "removed";

  const { data, error } = await supabase
    .from("organization_members")
    .update({ status: nextStatus, left_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .eq("status", "active")
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah keanggotaan ini.");
  }

  await logAuditEvent(ctx.userId, {
    p_action: isSelf ? "m12.organization_member.leave" : "m12.organization_member.remove",
    p_entity_type: "organization_members",
    p_entity_id: data.id,
    p_organization_id: data.organization_id,
    p_new_value: { status: data.status },
  });

  return { data };
});
