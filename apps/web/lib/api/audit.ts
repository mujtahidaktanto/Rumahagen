// lib/api/audit.ts
// Tulis audit_logs dari server (migration 0146). log_audit_event() tidak lagi bisa dipanggil pengguna lewat RPC karena sebelumnya siapa pun (termasuk anon)
// bisa memalsukan baris audit. Route API memanggil log_audit_event_for() lewat client service role dan menyebut user_id yang sudah diautentikasi server.
// JANGAN meneruskan user id dari body/query klien.

import { createAdminClient } from "@/lib/supabase/admin";

export interface AuditEventParams {
  p_action: string;
  p_entity_type?: string | null;
  p_entity_id?: string | null;
  p_organization_id?: string | null;
  p_old_value?: unknown;
  p_new_value?: unknown;
}

export async function logAuditEvent(userId: string | null | undefined, params: AuditEventParams) {
  return createAdminClient().rpc("log_audit_event_for", { p_user_id: userId ?? null, ...params });
}
