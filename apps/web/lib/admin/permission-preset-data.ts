// lib/admin/permission-preset-data.ts — Preset (M10, wireframe M10-Matriks-Izin tab 2): permission_presets/permission_preset_items/user_permission_presets (0004). Query sama persis dengan
// GET /admin/permissions/matrix/agent (API-145) — dijalankan langsung di server component (klien RLS-scoped sendiri) mengikuti pola lib/admin/*-data.ts lain, bukan lewat fetch ke /api/*
// sendiri. Kandidat "Tugaskan ke Akun" dibatasi ke user dengan role_id = target_role_id preset (trigger enforce_preset_assignee_matches_target_role, 0004, menegakkan kecocokan role ini).
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";
import type { GrantedScope } from "@/lib/admin/admin-rules";

export type PresetItem = { permissionId: string; actionCode: string; grantedScope: GrantedScope };
export type PresetRow = { id: string; name: string; targetRoleId: string; itemCount: number; assignedCount: number; items: PresetItem[] };

export async function getPresetsForTargetRole(targetRoleId: string): Promise<Part<PresetRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("permission_presets")
    .select("id, name, target_role_id, permission_preset_items(permission_id, granted_scope, permissions(action_code)), user_permission_presets(user_id)")
    .eq("target_role_id", targetRoleId)
    .order("created_at", { ascending: false })
    .returns<
      {
        id: string;
        name: string;
        target_role_id: string;
        permission_preset_items: { permission_id: string; granted_scope: GrantedScope; permissions: { action_code: string } | null }[];
        user_permission_presets: { user_id: string }[];
      }[]
    >();
  if (error) return { ok: false };

  return {
    ok: true,
    data: (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      targetRoleId: p.target_role_id,
      itemCount: p.permission_preset_items.length,
      assignedCount: p.user_permission_presets.length,
      items: p.permission_preset_items.map((it) => ({ permissionId: it.permission_id, actionCode: it.permissions?.action_code ?? "", grantedScope: it.granted_scope })),
    })),
  };
}

export type PresetAssignCandidate = { id: string; name: string; email: string | null; currentPresetId: string | null; currentPresetName: string | null };

export async function getPresetAssignCandidates(targetRoleId: string): Promise<Part<PresetAssignCandidate[]>> {
  const supabase = await createClient();
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id")
    .eq("role_id", targetRoleId)
    .order("created_at", { ascending: false })
    .returns<{ id: string }[]>();
  if (usersErr) return { ok: false };
  if (!users || users.length === 0) return { ok: true, data: [] };
  const userIds = users.map((u) => u.id);

  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", userIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const { data: assignments, error: assignErr } = await supabase
    .from("user_permission_presets")
    .select("user_id, preset_id, permission_presets(name)")
    .in("user_id", userIds)
    .returns<{ user_id: string; preset_id: string; permission_presets: { name: string } | null }[]>();
  if (assignErr) return { ok: false };
  const presetByUser = new Map(assignments?.map((a) => [a.user_id, { id: a.preset_id, name: a.permission_presets?.name ?? "" }]));

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const authById = new Map(authList.users.map((u) => [u.id, u]));

  return {
    ok: true,
    data: users.map((u) => {
      const authUser = authById.get(u.id);
      const meta = (authUser?.user_metadata ?? {}) as { full_name?: unknown; name?: unknown };
      const metaName = [meta.full_name, meta.name].find((v): v is string => typeof v === "string" && v.trim() !== "")?.trim();
      const email = authUser?.email ?? null;
      const assignment = presetByUser.get(u.id);
      return {
        id: u.id,
        name: nameByUser.get(u.id)?.trim() || metaName || (email ? email.split("@")[0]! : u.id.slice(0, 8)),
        email,
        currentPresetId: assignment?.id ?? null,
        currentPresetName: assignment?.name || null,
      };
    }),
  };
}
