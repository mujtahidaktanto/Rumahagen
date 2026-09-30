// lib/partner/learning-results-rules.ts — aturan murni Hasil Kemitraan (M04, wireframe 03-Developer-Partner/M04-Hasil-Kemitraan). validation_status persis CHECK constraint
// partnership_learning_results.validation_status (migration 0024) — hanya Superadmin yang bisa mengubahnya (trigger trg_partnership_result_validation_superadmin_only), jadi
// TIDAK ADA kontrol status di form ini; hasil baru selalu lahir "pending". "Sesi pembelajaran terkait" TIDAK berupa pemilih hidup — Developer Partner tidak punya izin
// m04.learning_session.view sama sekali (dicek langsung di role_permissions live), jadi hanya field ID sesi (opsional, ditempel manual) tanpa nama sesi yang dijamin benar.
import type { BadgeTone } from "@/components/ui/Badge";

export const VALIDATION_STATUS_LABEL: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Menunggu Validasi", tone: "warning" },
  validated: { label: "Tervalidasi", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
};
export const validationStatus = (s: string) => VALIDATION_STATUS_LABEL[s] ?? { label: s, tone: "neutral" as BadgeTone };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LearningResultForm = { resultType: string; resultSummary: string; provenanceSource: string; provenanceReference: string; sessionId: string; resultPayload: string };

export const EMPTY_LEARNING_RESULT: LearningResultForm = { resultType: "", resultSummary: "", provenanceSource: "", provenanceReference: "", sessionId: "", resultPayload: "" };

export type LearningResultErrors = Partial<Record<"resultType" | "provenanceSource" | "provenanceReference" | "sessionId" | "resultPayload", string>>;

export function validateLearningResultForm(f: LearningResultForm): LearningResultErrors {
  const errors: LearningResultErrors = {};
  if (!f.resultType.trim()) errors.resultType = "Jenis hasil wajib diisi.";
  else if (f.resultType.trim().length > 100) errors.resultType = "Maksimal 100 karakter.";
  if (!f.provenanceSource.trim()) errors.provenanceSource = "Asal data wajib diisi.";
  else if (f.provenanceSource.trim().length > 150) errors.provenanceSource = "Maksimal 150 karakter.";
  if (!f.provenanceReference.trim()) errors.provenanceReference = "Referensi wajib diisi agar hasil bisa ditelusuri.";
  if (f.sessionId.trim() && !UUID_RE.test(f.sessionId.trim())) errors.sessionId = "Harus ID sesi yang valid (format UUID).";
  if (f.resultPayload.trim()) {
    try {
      const parsed: unknown = JSON.parse(f.resultPayload);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) errors.resultPayload = "Harus objek JSON, mis. {\"peserta\": 20}.";
    } catch {
      errors.resultPayload = "Format JSON tidak valid.";
    }
  }
  return errors;
}

export function toLearningResultPayload(f: LearningResultForm): Record<string, unknown> {
  return {
    result_type: f.resultType.trim(),
    result_summary: f.resultSummary.trim() || undefined,
    provenance_source: f.provenanceSource.trim(),
    provenance_reference: f.provenanceReference.trim(),
    session_id: f.sessionId.trim() || undefined,
    result_payload: f.resultPayload.trim() ? (JSON.parse(f.resultPayload) as Record<string, unknown>) : undefined,
  };
}
