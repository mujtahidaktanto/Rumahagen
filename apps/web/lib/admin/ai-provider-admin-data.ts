// lib/admin/ai-provider-admin-data.ts — Provider AI (M13, wireframe 02-Admin/M13-Provider-Catalogue): tab Katalog Provider (ai_providers, 0015) dan tab Koneksi Agent (agent_ai_connections,
// 0016/0093, lintas semua agent). RLS ai_providers_select_active_or_admin (0015) HANYA mengizinkan Superadmin melihat provider 'inactive' — Admin/Manager cuma melihat yang 'active' (dibaca
// apa adanya lewat sesi RLS pemanggil, BUKAN admin client, supaya perbedaan ini otomatis berlaku tanpa filter tambahan di sini). Tab Koneksi Agent: RLS agent_ai_connections_select
// (has_permission m13.own_byok_connection.view) HANYA memberi Superadmin scope 'all' — Admin/Manager TIDAK PERNAH diberi grant permission ini sama sekali (beda dari yang tersirat wireframe
// "staf bisa lihat, cuma tidak bisa Force Action") — jadi tab ini Superadmin-only sepenuhnya, dicek eksplisit di halaman sebelum memanggil getAllAiConnections().
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import type { AiBillingType, AiConnectionStatus } from "@/lib/agent/ai-rules";

export type AiProviderAdminRow = {
  id: string;
  code: string;
  displayName: string;
  billingType: AiBillingType;
  setupInstructionsUrl: string;
  usageTermsNote: string | null;
  requiresExpiryWarning: boolean;
  status: "active" | "inactive";
};

export async function getAiProviderCatalog(): Promise<Part<AiProviderAdminRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_providers")
    .select("id, code, display_name, billing_type, setup_instructions_url, usage_terms_note, requires_expiry_warning, status")
    .order("display_name")
    .returns<
      { id: string; code: string; display_name: string; billing_type: AiBillingType; setup_instructions_url: string; usage_terms_note: string | null; requires_expiry_warning: boolean; status: "active" | "inactive" }[]
    >();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((p) => ({
      id: p.id,
      code: p.code,
      displayName: p.display_name,
      billingType: p.billing_type,
      setupInstructionsUrl: p.setup_instructions_url,
      usageTermsNote: p.usage_terms_note,
      requiresExpiryWarning: p.requires_expiry_warning,
      status: p.status,
    })),
  };
}

export type AiConnectionAdminRow = { id: string; agentName: string; providerName: string; status: AiConnectionStatus; connectedAt: string };

export async function getAllAiConnections(): Promise<Part<AiConnectionAdminRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_ai_connections")
    .select("id, user_id, status, connected_at, ai_providers(display_name)")
    .order("connected_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; user_id: string; status: AiConnectionStatus; connected_at: string; ai_providers: { display_name: string } | null }[]>();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const userIds = [...new Set(data.map((c) => c.user_id))];
  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", userIds);
  if (profilesErr) return { ok: false };
  const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  return {
    ok: true,
    data: data.map((c) => ({
      id: c.id,
      agentName: nameByUser.get(c.user_id)?.trim() || c.user_id.slice(0, 8),
      providerName: c.ai_providers?.display_name ?? "—",
      status: c.status,
      connectedAt: c.connected_at,
    })),
  };
}
