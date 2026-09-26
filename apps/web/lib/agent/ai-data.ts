// lib/agent/ai-data.ts — data layar Koneksi AI Saya dan AI Assistant (M13 BYOK: migration 0015/0016/0080/0093; permission m13.own_byok_connection.* untuk role Agent ditambahkan 0164).
// Dibaca langsung dari Supabase dengan RLS pemanggil (agent_ai_connections_select, ai_providers_select_active_or_admin) — bukan lewat /api/* (aturan itu untuk kode BROWSER; komponen
// server boleh query langsung, pola sama seperti lib/agent/org-data.ts dan dashboard-data.ts). encrypted_api_key/encrypted_secondary_key TIDAK PERNAH di-select di sini.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "./dashboard-data";
import type { AiBillingType, AiConnectionStatus } from "./ai-rules";

export type AiProviderInfo = {
  id: string;
  code: string;
  displayName: string;
  logoUrl: string | null;
  billingType: AiBillingType;
  setupInstructionsUrl: string;
  usageTermsNote: string | null;
};

export type AiConnection = {
  id: string;
  providerId: string;
  provider: AiProviderInfo | null;
  status: AiConnectionStatus;
  disabledByAdmin: boolean;
  lastValidatedAt: string | null;
  connectedAt: string;
};

export type AiConnectionsPageData = { connections: Part<AiConnection[]>; providers: Part<AiProviderInfo[]> };

type ProviderRow = { id: string; code: string; display_name: string; logo_url: string | null; billing_type: AiBillingType; setup_instructions_url: string; usage_terms_note: string | null };
type ConnectionRow = {
  id: string;
  provider_id: string;
  status: AiConnectionStatus;
  disabled_by_admin: boolean;
  last_validated_at: string | null;
  connected_at: string;
  ai_providers: ProviderRow | ProviderRow[] | null;
};

type Supabase = Awaited<ReturnType<typeof createClient>>;

const toProvider = (p: ProviderRow): AiProviderInfo => ({
  id: p.id,
  code: p.code,
  displayName: p.display_name,
  logoUrl: p.logo_url,
  billingType: p.billing_type,
  setupInstructionsUrl: p.setup_instructions_url,
  usageTermsNote: p.usage_terms_note,
});

const oneOf = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export async function getAiConnectionsPage(userId: string): Promise<AiConnectionsPageData> {
  const supabase = await createClient();
  const [connRes, provRes] = await Promise.all([
    supabase
      .from("agent_ai_connections")
      .select(
        "id, provider_id, status, disabled_by_admin, last_validated_at, connected_at, ai_providers(id, code, display_name, logo_url, billing_type, setup_instructions_url, usage_terms_note)",
      )
      .eq("user_id", userId)
      .order("connected_at", { ascending: false })
      .returns<ConnectionRow[]>(),
    supabase
      .from("ai_providers")
      .select("id, code, display_name, logo_url, billing_type, setup_instructions_url, usage_terms_note")
      .eq("status", "active")
      .order("display_name")
      .returns<ProviderRow[]>(),
  ]);

  const connections: Part<AiConnection[]> = connRes.error
    ? { ok: false }
    : {
        ok: true,
        data: (connRes.data ?? []).map((r) => {
          const p = oneOf(r.ai_providers);
          return {
            id: r.id,
            providerId: r.provider_id,
            provider: p ? toProvider(p) : null,
            status: r.status,
            disabledByAdmin: r.disabled_by_admin,
            lastValidatedAt: r.last_validated_at,
            connectedAt: r.connected_at,
          };
        }),
      };

  const providers: Part<AiProviderInfo[]> = provRes.error ? { ok: false } : { ok: true, data: (provRes.data ?? []).map(toProvider) };

  return { connections, providers };
}

export type ActiveAiConnection = { id: string; providerName: string; providerCode: string };
type ActiveConnectionRow = { id: string; ai_providers: Pick<ProviderRow, "display_name" | "code"> | Pick<ProviderRow, "display_name" | "code">[] | null };

/** Koneksi berstatus 'active' saja, untuk AI Assistant — hanya koneksi ini yang boleh dipakai invocation (Gate PRE-00-O §7-8: "AI DITOLAK selagi UNVERIFIED"). providerCode dipakai memilih daftar model (lib/agent/ai-rules.ts, cocok dengan resolveAdapter di lib/ai/adapters.ts). */
export async function getActiveAiConnectionsForChat(userId: string, supabase?: Supabase): Promise<Part<ActiveAiConnection[]>> {
  const sb = supabase ?? (await createClient());
  const { data, error } = await sb
    .from("agent_ai_connections")
    .select("id, ai_providers(display_name, code)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("connected_at", { ascending: false })
    .returns<ActiveConnectionRow[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((r) => {
      const p = oneOf(r.ai_providers);
      return { id: r.id, providerName: p?.display_name ?? "Provider AI", providerCode: p?.code ?? "" };
    }),
  };
}
