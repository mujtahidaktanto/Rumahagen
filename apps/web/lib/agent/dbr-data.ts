// lib/agent/dbr-data.ts — data Kalkulator DBR Agent (M07), dibaca di server dengan RLS pemanggil: bank aktif (Bank Master, migration 0089), riwayat simulasi milik sendiri, detail satu simulasi, dan hasil yang
// dibagikan untuk prospek. Simulasi bersifat historis (append-only): hasil dihitung server saat POST /dbr-simulations dan tidak berubah. Mutasi dikerjakan komponen klien lewat /api/*.
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "./dbr-rules";
import { toSimulation, type DbrSimulation, type SimRow } from "./dbr-types";

export type { DbrSimulation };

export type Part<T> = { ok: true; data: T } | { ok: false };

export type DbrBank = { id: string; name: string; thresholdPercent: number; defaultRate: number };

const SELECT = "id, bank_id, prospect_name, prospect_phone, net_income, existing_installments, property_price, down_payment, loan_amount, tenor_months, interest_rate_annual, monthly_installment, dbr_percent, eligibility_status, threshold_used, created_at, share_token, shared_at, revoked_at, banks(name)";

/** Bank aktif untuk dipilih (sama dengan GET /calculator/dbr/config). */
export async function getActiveBanks(): Promise<Part<DbrBank[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banks")
    .select("id, name, dbr_threshold_percent, default_interest_rate")
    .eq("status", "active")
    .order("name")
    .returns<{ id: string; name: string; dbr_threshold_percent: number | string; default_interest_rate: number | string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((b) => ({ id: b.id, name: b.name, thresholdPercent: Number(b.dbr_threshold_percent), defaultRate: Number(b.default_interest_rate) })) };
}

export const DBR_PAGE_SIZE = 10;

export async function getDbrHistory(userId: string, limit: number): Promise<Part<{ items: DbrSimulation[]; total: number }>> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("dbr_simulations")
    .select(SELECT, { count: "exact" })
    .eq("agent_id", userId)
    .order("created_at", { ascending: false })
    .range(0, limit - 1)
    .returns<SimRow[]>();
  if (error) return { ok: false };
  const items = (data ?? []).map(toSimulation);
  return { ok: true, data: { items, total: count ?? items.length } };
}

export type DbrDetailResult = { state: "ok"; simulation: DbrSimulation } | { state: "not_found" } | { state: "error" };

/** Detail satu simulasi milik sendiri; milik orang lain atau id tidak valid = tidak ditemukan. */
export async function getDbrSimulation(id: string, userId: string): Promise<DbrDetailResult> {
  if (!isUuid(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("dbr_simulations").select(SELECT).eq("id", id).eq("agent_id", userId).maybeSingle<SimRow>();
  if (error) return { state: "error" };
  return data ? { state: "ok", simulation: toSimulation(data) } : { state: "not_found" };
}

// ── Halaman berbagi untuk prospek (tanpa login) ──
/**
 * Hanya bidang yang perlu dilihat prospek. RPC get_shared_dbr_simulation mengembalikan SELURUH baris (termasuk agent_id, listing_id, bank_id, share_token, nomor telepon, penghasilan, cicilan berjalan),
 * jadi halaman publik memilih bidang secara eksplisit di server dan tidak pernah meneruskan baris mentah ke browser.
 */
export type SharedDbr = {
  bankName: string;
  prospectName: string | null;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  tenorMonths: number;
  interestRateAnnual: number;
  monthlyInstallment: number;
  dbrPercent: number;
  eligibilityStatus: string;
  thresholdUsed: number;
  createdAt: string;
};
export type SharedDbrResult = { state: "ok"; data: SharedDbr } | { state: "not_found" } | { state: "error" };

// Keluaran get_shared_dbr_simulation (migration 0163): hanya kolom hasil + bank_name; tanpa bank_id, telepon, penghasilan, cicilan berjalan, id agen, dan token.
type SharedRow = {
  bank_name: string | null;
  prospect_name: string | null;
  property_price: number | string;
  down_payment: number | string;
  loan_amount: number | string;
  tenor_months: number;
  interest_rate_annual: number | string;
  monthly_installment: number | string;
  dbr_percent: number | string;
  eligibility_status: string;
  threshold_used: number | string | null;
  created_at: string;
};

export async function getSharedDbr(token: string): Promise<SharedDbrResult> {
  if (!isUuid(token)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_dbr_simulation", { p_share_token: token }).single<SharedRow>();
  // Token salah, dicabut, atau tidak ada semuanya sama: RPC melempar galat → tidak ditemukan (tidak membedakan alasan).
  if (error || !data) return { state: "not_found" };
  try {
    return {
      state: "ok",
      data: {
        bankName: data.bank_name ?? "—",
        prospectName: data.prospect_name,
        propertyPrice: Number(data.property_price),
        downPayment: Number(data.down_payment),
        loanAmount: Number(data.loan_amount),
        tenorMonths: data.tenor_months,
        interestRateAnnual: Number(data.interest_rate_annual),
        monthlyInstallment: Number(data.monthly_installment),
        dbrPercent: Number(data.dbr_percent),
        eligibilityStatus: data.eligibility_status,
        thresholdUsed: Number(data.threshold_used ?? 0),
        createdAt: data.created_at,
      },
    };
  } catch {
    return { state: "error" };
  }
}
