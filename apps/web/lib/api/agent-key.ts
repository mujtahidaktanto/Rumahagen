// lib/api/agent-key.ts
// Profil publik Agent dapat dicari dengan public_slug ATAU user_id (UUID). user_id boleh publik: hanya identitas internal RumahAgen (keputusan produk 2026-09-25).
// Dipakai rute GET /agents/{id}, /agents/{id}/awards/presentation, dan /agents/{id}/credentials yang membaca view public_agent_profiles (migration 0148).

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function agentLookup(param: string | undefined): { column: "user_id" | "public_slug"; value: string } {
  const value = param ?? "";
  return { column: UUID_RE.test(value) ? "user_id" : "public_slug", value };
}
