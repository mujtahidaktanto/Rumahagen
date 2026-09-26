// lib/admin/commercial-reconciliation-data.ts — Komersial & Rekonsiliasi (M14, wireframe 02-Admin/M14-Komersial-Admin): reconciliation_cases (0076). RLS reconciliation_cases_select/insert/
// update (0084, m14.commercial_administration.manage_commercial_resources) HANYA memberi Superadmin+Admin 'all' scope — Manager TIDAK PERNAH diberi grant sama sekali (dikonfirmasi migration
// 0084's comment sendiri: "Review/Escalate yang tetap Admin+Superadmin"), beda dari klaim komentar wireframe ("Admin+Manager+Superadmin"). Manual Correction
// (m14.commercial_administration.manual_correction) Superadmin-only TAPI tidak ada endpoint REST sama sekali untuk mutasinya (dicek menyeluruh) — lihat ManualCorrectionZone.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type ReconciliationStatus = "open" | "investigating" | "resolved" | "rejected" | "escalated";
export type ReconciliationCaseRow = { id: string; caseNumber: string; mismatchCategory: string; status: ReconciliationStatus; openedAt: string };

export async function getReconciliationCases(): Promise<Part<ReconciliationCaseRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reconciliation_cases")
    .select("id, case_number, mismatch_category, status, opened_at")
    .order("opened_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; case_number: string; mismatch_category: string; status: ReconciliationStatus; opened_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((c) => ({ id: c.id, caseNumber: c.case_number, mismatchCategory: c.mismatch_category, status: c.status, openedAt: c.opened_at })) };
}
