// lib/admin/award-appeal-data.ts — Banding Penghargaan (M15, wireframe 02-Admin/M15-Award-Appeal): award_appeals (0098) hanya untuk award berstatus 'revoked'. RLS award_appeals_select
// mengizinkan Superadmin/Admin/Manager (has_permission tanpa owner_id, scope 'all' m15.award.revoke/manage) melihat SEMUA baris lintas agent; keputusan (award_appeals_decide) juga hanya
// scope 'all' — Agent (scope 'own') tidak lolos sama sekali (anti self-approval by design, ditegaskan komentar migration).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type AppealStatus = "pending" | "approved" | "rejected";
export type AwardStatus = "active" | "expired" | "revoked" | "restored";

export type AwardAppealRow = {
  id: string;
  awardId: string;
  appellantName: string;
  titleName: string;
  reason: string;
  appealStatus: AppealStatus;
  awardStatus: AwardStatus;
};

export async function getAwardAppeals(): Promise<Part<AwardAppealRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("award_appeals")
    .select("id, award_id, appellant_id, reason, status, award_instances(status, title_definitions(name))")
    .order("created_at", { ascending: false })
    .returns<
      { id: string; award_id: string; appellant_id: string; reason: string; status: AppealStatus; award_instances: { status: AwardStatus; title_definitions: { name: string } | null } | null }[]
    >();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const appellantIds = [...new Set(data.map((a) => a.appellant_id))];
  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", appellantIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  return {
    ok: true,
    data: data.map((a) => ({
      id: a.id,
      awardId: a.award_id,
      appellantName: nameByUser.get(a.appellant_id)?.trim() || a.appellant_id.slice(0, 8),
      titleName: a.award_instances?.title_definitions?.name ?? "—",
      reason: a.reason,
      appealStatus: a.status,
      awardStatus: a.award_instances?.status ?? "revoked",
    })),
  };
}
