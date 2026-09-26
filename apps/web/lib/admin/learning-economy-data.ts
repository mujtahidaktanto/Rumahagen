// lib/admin/learning-economy-data.ts — Ekonomi Pembelajaran (M04, wireframe 02-Admin/M04-Learning-Economy-Config): 3 tab — Konfigurasi Ekonomi (learning_economy_configs, key-value bebas,
// migration 0109), Katalog Aktivitas (learning_activities, 0058), Poin & Sertifikat (adjust_learning_points RPC/0046, admin_issue_certificate RPC/0150). Ketiganya Superadmin/Admin/Manager.
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";

export type LearningEconomyConfigRow = { configKey: string; configValue: string | null };

export async function getLearningEconomyConfigs(): Promise<Part<LearningEconomyConfigRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("learning_economy_configs").select("config_key, config_value").order("config_key").returns<{ config_key: string; config_value: string | null }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((c) => ({ configKey: c.config_key, configValue: c.config_value })) };
}

export type LearningActivityRow = {
  id: string;
  code: string;
  activityType: string;
  title: string;
  sequenceNo: number | null;
  completionRequired: boolean;
  rewardLp: number;
  status: string;
};

export async function getLearningActivities(): Promise<Part<LearningActivityRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_activities")
    .select("id, code, activity_type, title, sequence_no, completion_required, reward_lp, status")
    .order("sequence_no", { ascending: true })
    .returns<{ id: string; code: string; activity_type: string; title: string; sequence_no: number | null; completion_required: boolean; reward_lp: number; status: string }[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      code: a.code,
      activityType: a.activity_type,
      title: a.title,
      sequenceNo: a.sequence_no,
      completionRequired: a.completion_required,
      rewardLp: a.reward_lp,
      status: a.status,
    })),
  };
}

export type AgentPickerRow = { id: string; name: string; email: string | null };

export async function getActiveAgentsForPicker(): Promise<Part<AgentPickerRow[]>> {
  const supabase = await createClient();
  const { data: agentRole, error: roleErr } = await supabase.from("roles").select("id").eq("code", "agent").maybeSingle();
  if (roleErr || !agentRole) return { ok: false };

  const { data: users, error: usersErr } = await supabase.from("users").select("id").eq("role_id", agentRole.id).eq("status", "active").returns<{ id: string }[]>();
  if (usersErr) return { ok: false };
  if (!users || users.length === 0) return { ok: true, data: [] };

  const userIds = users.map((u) => u.id);
  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", userIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const authById = new Map(authList.users.map((u) => [u.id, u]));

  return {
    ok: true,
    data: users.map((u) => {
      const authUser = authById.get(u.id);
      const email = authUser?.email ?? null;
      return { id: u.id, name: nameByUser.get(u.id)?.trim() || email?.split("@")[0] || u.id.slice(0, 8), email };
    }),
  };
}

export type CoursePickerRow = { id: string; title: string };

export async function getCoursesForPicker(): Promise<Part<CoursePickerRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("id, title").order("title").returns<CoursePickerRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}
