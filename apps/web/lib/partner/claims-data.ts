// lib/partner/claims-data.ts — data Review Klaim (M06, wireframe 03-Developer-Partner/M06-Review-Klaim). Klaim lintas proyek lewat RPC partner_incoming_claims
// (migration 0147) — menutup celah lama "tidak ada agregat klaim masuk lintas proyek" (SOURCE-Developer-Partner.md §6). RPC memuat nama, WhatsApp, dan email
// Agent TERLEPAS dari pengaturan visibilitas profil (keputusan produk 2026-09-25: mengajukan klaim = kesediaan dihubungi developer pemilik proyek); slug
// profil publik hanya bila profil berstatus public. Dipanggil langsung di server di sini (bukan lewat GET /developer-partners/me/claims sendiri).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type IncomingClaimRow = {
  claimId: string;
  projectId: string;
  projectName: string;
  projectStatus: string;
  agentId: string;
  agentName: string | null;
  agentPublicSlug: string | null;
  agentWhatsapp: string | null;
  agentEmail: string | null;
  status: string;
  claimedAt: string;
  reviewedAt: string | null;
};

type RpcRow = {
  claim_id: string;
  project_id: string;
  project_name: string;
  project_status: string;
  agent_id: string;
  agent_name: string | null;
  agent_public_slug: string | null;
  agent_whatsapp: string | null;
  agent_email: string | null;
  status: string;
  claimed_at: string;
  reviewed_at: string | null;
};

export async function getIncomingClaims(status?: string, projectId?: string): Promise<Part<IncomingClaimRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("partner_incoming_claims", {
    p_status: status ?? null,
    p_project_id: projectId ?? null,
    p_partner_id: null,
    p_limit: 200,
    p_offset: 0,
  });
  if (error) return { ok: false };
  const rows = (data ?? []) as RpcRow[];
  return {
    ok: true,
    data: rows.map((r) => ({
      claimId: r.claim_id,
      projectId: r.project_id,
      projectName: r.project_name,
      projectStatus: r.project_status,
      agentId: r.agent_id,
      agentName: r.agent_name,
      agentPublicSlug: r.agent_public_slug,
      agentWhatsapp: r.agent_whatsapp,
      agentEmail: r.agent_email,
      status: r.status,
      claimedAt: r.claimed_at,
      reviewedAt: r.reviewed_at,
    })),
  };
}
