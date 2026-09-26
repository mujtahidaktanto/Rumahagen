// lib/admin/bank-master-data.ts — Bank Master (M07, wireframe 02-Admin/M07-Bank-Master): tab Daftar Bank (banks, 0089 — RLS banks_select memberi Manager/Admin/Agent VIEW, banks_manage
// hanya Admin+Superadmin) dan tab Oversight Simulasi DBR (dbr_simulations, 0052/0089/0099 — RLS dbr_simulations_select scope 'all' untuk Superadmin/Admin/Manager, jadi Manager JUGA bisa
// melihat tab ini, beda dari Audit Log yang Manager-nya sama sekali tidak lolos). Nama agent diresolusi dari agent_profiles.full_name (sama seperti layar admin lain).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type BankStatus = "active" | "inactive";
export type BankRow = { id: string; name: string; dbrThresholdPercent: number; defaultInterestRate: number; status: BankStatus };

export async function getBanks(): Promise<Part<BankRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banks")
    .select("id, name, dbr_threshold_percent, default_interest_rate, status")
    .order("name")
    .returns<{ id: string; name: string; dbr_threshold_percent: number; default_interest_rate: number; status: BankStatus }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((b) => ({ id: b.id, name: b.name, dbrThresholdPercent: b.dbr_threshold_percent, defaultInterestRate: b.default_interest_rate, status: b.status })) };
}

/** CHECK constraint dbr_simulations.eligibility_status (0052) — TIGA nilai, bukan dua seperti contoh di wireframe. */
export type EligibilityStatus = "layak" | "perlu_review" | "tidak_layak";

export type DbrSimRow = {
  id: string;
  agentName: string;
  bankName: string;
  prospectName: string | null;
  dbrPercent: number;
  eligibilityStatus: EligibilityStatus;
  createdAt: string;
};

export async function getDbrOversight(filters: { agentId?: string }): Promise<Part<DbrSimRow[]>> {
  const supabase = await createClient();
  let query = supabase
    .from("dbr_simulations")
    .select("id, agent_id, prospect_name, dbr_percent, eligibility_status, created_at, banks(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.agentId) query = query.eq("agent_id", filters.agentId);

  const { data, error } = await query.returns<
    { id: string; agent_id: string; prospect_name: string | null; dbr_percent: number; eligibility_status: EligibilityStatus; created_at: string; banks: { name: string } | null }[]
  >();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const agentIds = [...new Set(data.map((r) => r.agent_id))];
  const { data: profiles, error: profilesErr } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", agentIds);
  if (profilesErr) return { ok: false };
  const nameByAgent = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  return {
    ok: true,
    data: data.map((r) => ({
      id: r.id,
      agentName: nameByAgent.get(r.agent_id)?.trim() || r.agent_id.slice(0, 8),
      bankName: r.banks?.name ?? "—",
      prospectName: r.prospect_name,
      dbrPercent: r.dbr_percent,
      eligibilityStatus: r.eligibility_status,
      createdAt: r.created_at,
    })),
  };
}
