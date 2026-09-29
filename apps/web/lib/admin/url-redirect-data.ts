// lib/admin/url-redirect-data.ts — data Pengalihan URL (M11, wireframe 02-Admin/M11-Pengalihan-URL): url_redirects (migration 0051), terbuka dibaca siapa pun (url_redirects_select_public)
// tapi ditulis hanya staf (m11.static_public_content.publish, migration 0130).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type RedirectRow = { id: string; oldPath: string; newPath: string; redirectType: number; reason: string | null; entityType: string | null; entityId: string | null; createdAt: string };

export async function getUrlRedirects(): Promise<Part<RedirectRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("url_redirects")
    .select("id, old_path, new_path, redirect_type, reason, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300)
    .returns<{ id: string; old_path: string; new_path: string; redirect_type: number; reason: string | null; entity_type: string | null; entity_id: string | null; created_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((r) => ({ id: r.id, oldPath: r.old_path, newPath: r.new_path, redirectType: r.redirect_type, reason: r.reason, entityType: r.entity_type, entityId: r.entity_id, createdAt: r.created_at })) };
}
