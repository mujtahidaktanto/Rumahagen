// lib/admin/awarding-path-data.ts — Jalur Penghargaan (M15, wireframe 02-Admin/M15-Awarding-Path-Admin): 3 tab — Title Definitions (title_definitions, 0026, SELECT publik),
// Awarding Path & Versi (awarding_paths/awarding_path_versions, 0064, SELECT staff-only lewat RLS FOR ALL m15.awarding_path_rule.configure — Superadmin/Admin/Manager, sama seperti WRITE),
// Cakupan Otoritas (title_authority_scopes, 0026, SELECT publik). Rule Version yang tertaut ke versi path (awarding_path_rules, 0065, N:N) dibaca langsung di sini untuk ditampilkan — TIDAK
// ADA endpoint REST untuk MENAUTKAN rule ke versi (dicek menyeluruh, F11-B8 tidak mengevidensinya), jadi UI di sini hanya menampilkan tautan yang sudah ada, tidak menyediakan aksi "tautkan".
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type TitleStatus = "draft" | "active" | "inactive" | "retired";
export type TitleDefRow = { id: string; code: string; name: string; description: string | null; status: TitleStatus };

export async function getTitleDefinitions(): Promise<Part<TitleDefRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_definitions")
    .select("id, code, name, description, status")
    .order("created_at", { ascending: false })
    .returns<TitleDefRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}

export type PathVersionStatus = "draft" | "active" | "retired";
export type PathVersionRow = { id: string; versionNo: number; status: PathVersionStatus; effectiveFrom: string | null; effectiveTo: string | null; ruleLabel: string | null };
export type AwardingPathRow = { id: string; code: string; name: string; status: string; titleId: string; titleName: string; versions: PathVersionRow[] };

export async function getAwardingPathsWithVersions(): Promise<Part<AwardingPathRow[]>> {
  const supabase = await createClient();
  const { data: paths, error: pathsErr } = await supabase
    .from("awarding_paths")
    .select("id, code, name, status, title_definition_id, title_definitions(name)")
    .order("created_at", { ascending: false })
    .returns<{ id: string; code: string; name: string; status: string; title_definition_id: string; title_definitions: { name: string } | null }[]>();
  if (pathsErr) return { ok: false };
  if (!paths || paths.length === 0) return { ok: true, data: [] };

  const pathIds = paths.map((p) => p.id);
  const { data: versions, error: versionsErr } = await supabase
    .from("awarding_path_versions")
    .select("id, awarding_path_id, version_no, status, effective_from, effective_to, awarding_path_rules(awarding_rule_versions(rule_code, version_no))")
    .in("awarding_path_id", pathIds)
    .order("version_no", { ascending: false })
    .returns<
      { id: string; awarding_path_id: string; version_no: number; status: PathVersionStatus; effective_from: string | null; effective_to: string | null; awarding_path_rules: { awarding_rule_versions: { rule_code: string; version_no: number } | null }[] }[]
    >();
  if (versionsErr) return { ok: false };

  const versionsByPath = new Map<string, PathVersionRow[]>();
  for (const v of versions ?? []) {
    const rule = v.awarding_path_rules.find((r) => r.awarding_rule_versions)?.awarding_rule_versions;
    const row: PathVersionRow = {
      id: v.id,
      versionNo: v.version_no,
      status: v.status,
      effectiveFrom: v.effective_from,
      effectiveTo: v.effective_to,
      ruleLabel: rule ? `${rule.rule_code} v${rule.version_no}` : null,
    };
    const list = versionsByPath.get(v.awarding_path_id) ?? [];
    list.push(row);
    versionsByPath.set(v.awarding_path_id, list);
  }

  return {
    ok: true,
    data: paths.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      status: p.status,
      titleId: p.title_definition_id,
      titleName: p.title_definitions?.name ?? "—",
      versions: versionsByPath.get(p.id) ?? [],
    })),
  };
}

export type ScopeStatus = "active" | "inactive";
export type TitleAuthorityScopeRow = { id: string; titleId: string; titleName: string; scopeType: string; scopeReference: string | null; status: ScopeStatus };

export async function getTitleAuthorityScopes(): Promise<Part<TitleAuthorityScopeRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_authority_scopes")
    .select("id, title_definition_id, scope_type, scope_reference, status, title_definitions(name)")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title_definition_id: string; scope_type: string; scope_reference: string | null; status: ScopeStatus; title_definitions: { name: string } | null }[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((s) => ({
      id: s.id,
      titleId: s.title_definition_id,
      titleName: s.title_definitions?.name ?? "—",
      scopeType: s.scope_type,
      scopeReference: s.scope_reference,
      status: s.status,
    })),
  };
}
