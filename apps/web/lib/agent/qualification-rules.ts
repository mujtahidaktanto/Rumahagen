// lib/agent/qualification-rules.ts — aturan murni layar Kualifikasi M15 (Bukti, Evaluasi & Penghargaan, Presentasi Title). Kunci Record status persis nilai CHECK constraint
// qualification_evaluations.result (0026), award_instances.status (0026), award_appeals.status (0098) — jangan menambah nilai yang tidak ada di constraint.
import type { BadgeTone } from "@/components/ui/Badge";

export type QualificationResult = "qualified" | "not_qualified" | "pending" | "failed" | "revoked";
export type AwardStatus = "active" | "expired" | "revoked" | "restored";
export type AppealStatus = "pending" | "approved" | "rejected";

export const QUALIFICATION_RESULT_LABEL: Record<QualificationResult, string> = {
  qualified: "Lulus",
  not_qualified: "Tidak Lulus",
  pending: "Menunggu",
  failed: "Gagal",
  revoked: "Dicabut",
};
export const QUALIFICATION_RESULT_TONE: Record<QualificationResult, BadgeTone> = {
  qualified: "success",
  not_qualified: "danger",
  pending: "warning",
  failed: "danger",
  revoked: "neutral",
};

export const AWARD_STATUS_LABEL: Record<AwardStatus, string> = {
  active: "Aktif",
  expired: "Kedaluwarsa",
  revoked: "Dicabut",
  restored: "Dipulihkan",
};
export const AWARD_STATUS_TONE: Record<AwardStatus, BadgeTone> = {
  active: "success",
  expired: "neutral",
  revoked: "danger",
  restored: "info",
};

export const APPEAL_STATUS_LABEL: Record<AppealStatus, string> = {
  pending: "Menunggu Keputusan",
  approved: "Disetujui",
  rejected: "Ditolak",
};
export const APPEAL_STATUS_TONE: Record<AppealStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

/** Banding (POST /awards/{id}/appeals) hanya untuk award yang sudah dicabut, dan hanya bila belum ada banding yang masih menunggu (unique index award_appeals_one_pending_per_award, 0098). */
export function canAppealAward(awardStatus: string, hasPendingAppeal: boolean): boolean {
  return awardStatus === "revoked" && !hasPendingAppeal;
}

export function validateAppealReason(reason: string): string | undefined {
  return reason.trim() ? undefined : "Alasan banding wajib diisi.";
}

// ── Ajukan Bukti Kualifikasi (qualification_evidence, 0026 + trigger submitter-rules 0128) ──
export type EvidenceSourceType = "upload" | "external_link";
export type SubmitEvidenceForm = { titleDefinitionId: string; evidenceType: string; sourceType: EvidenceSourceType; sourceReference: string; note: string };
export type SubmitEvidenceErrors = Partial<Record<"sourceReference", string>>;

export const EVIDENCE_TYPE_OPTIONS = ["Sertifikat", "Dokumen resmi", "Bukti aktivitas", "Lainnya"];
export const SOURCE_TYPE_OPTIONS: { value: EvidenceSourceType; label: string }[] = [
  { value: "upload", label: "Upload manual (nomor/referensi dokumen)" },
  { value: "external_link", label: "Tautan eksternal" },
];

export function validateSubmitEvidence(f: SubmitEvidenceForm): SubmitEvidenceErrors {
  const errors: SubmitEvidenceErrors = {};
  if (!f.sourceReference.trim()) errors.sourceReference = "Referensi bukti wajib diisi agar bisa dievaluasi.";
  return errors;
}

/**
 * user_id diisi di sini (RLS qualification_evidence_insert mengecek scope OWN lewat kolom ini, bukan dari sesi server). Kolom
 * title tujuan dan catatan TIDAK ada di skema (0026) -> disimpan di evidence_payload { target_title, note }. source_type dibatasi
 * trigger 0128 hanya 'upload'|'external_link' untuk pengguna biasa; qualification_evaluation_id tidak pernah dikirim (evaluasi
 * hanya oleh staf/sistem).
 */
export function toCreateEvidencePayload(userId: string, f: SubmitEvidenceForm, titleName: string | null) {
  const evidence_payload: Record<string, unknown> = {};
  if (titleName) evidence_payload.target_title = titleName;
  if (f.note.trim()) evidence_payload.note = f.note.trim();
  return {
    user_id: userId,
    evidence_type: f.evidenceType,
    source_type: f.sourceType,
    source_reference: f.sourceReference.trim(),
    ...(Object.keys(evidence_payload).length > 0 ? { evidence_payload } : {}),
  };
}

// ── Presentasi Title (title_presentations 0068/0128, RPC set_my_public_titles 0148) ──
export function titlePresentationRuleText(heldCount: number): string {
  if (heldCount === 0) return "Anda belum punya title aktif untuk ditampilkan.";
  if (heldCount === 1) return "Title pertama Anda otomatis tampil sebagai Utama.";
  if (heldCount <= 4) return `Anda punya ${heldCount} title: semuanya tampil. Pilih satu sebagai Utama, sisanya menjadi tambahan.`;
  return `Anda punya ${heldCount} title: pilih maksimal 1 utama + 3 tambahan yang tampil.`;
}

/** >4 award: Agent bebas memilih title mana yang tampil/disembunyikan. <=4: semua WAJIB tampil (set_my_public_titles menolak selain itu, 0148). */
export function canCustomizeTitleSelection(heldCount: number): boolean {
  return heldCount > 4;
}
