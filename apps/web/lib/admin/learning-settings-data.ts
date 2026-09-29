// lib/admin/learning-settings-data.ts — data Konfigurasi Belajar (M04, wireframe 02-Admin/M04-Konfigurasi-Belajar): baris tunggal learning_settings (migration 0150) dan "Riwayat perubahan"
// dari audit_logs (action m04.learning_settings.update, ditulis otomatis oleh route PATCH). Bacaan langsung Supabase (RLS pemanggil) — sama data dengan GET /admin/learning/settings, tapi
// dibaca sekali di server bersama audit log tanpa panggilan API kedua.
import { createClient } from "@/lib/supabase/server";
import { certAssetSignedUrl } from "@/lib/storage/certificate-assets";
import type { Part } from "@/lib/agent/dashboard-data";
import { getAuditLogPage, type AuditLogRow } from "./audit-data";
import type { CertTemplate } from "./course-labels";

export type LearningSettings = {
  version: number;
  externalQuizMaxAttempts: number | null;
  externalQuizCooldownMinutes: number;
  certificateAutoIssue: boolean;
  defaultCertificateTemplate: CertTemplate;
  defaultSignerName: string;
  defaultSignerTitle: string;
  defaultSignerSignaturePath: string | null;
  defaultSignerSignatureUrl: string | null;
  signupBonusLp: number;
  rewardLpEnrollment: number;
  rewardLpCompletion: number;
  rewardLpQuizPass: number;
};

type Row = {
  version: number;
  external_quiz_max_attempts: number | null;
  external_quiz_cooldown_minutes: number;
  certificate_auto_issue: boolean;
  default_certificate_template: CertTemplate;
  default_signer_name: string;
  default_signer_title: string;
  default_signer_signature_path: string | null;
  signup_bonus_lp: number;
  reward_lp_enrollment: number;
  reward_lp_completion: number;
  reward_lp_quiz_pass: number;
};

export async function getLearningSettings(): Promise<Part<LearningSettings>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_settings")
    .select("version, external_quiz_max_attempts, external_quiz_cooldown_minutes, certificate_auto_issue, default_certificate_template, default_signer_name, default_signer_title, default_signer_signature_path, signup_bonus_lp, reward_lp_enrollment, reward_lp_completion, reward_lp_quiz_pass")
    .maybeSingle<Row>();
  if (error || !data) return { ok: false };
  return {
    ok: true,
    data: {
      version: data.version,
      externalQuizMaxAttempts: data.external_quiz_max_attempts,
      externalQuizCooldownMinutes: data.external_quiz_cooldown_minutes,
      certificateAutoIssue: data.certificate_auto_issue,
      defaultCertificateTemplate: data.default_certificate_template,
      defaultSignerName: data.default_signer_name,
      defaultSignerTitle: data.default_signer_title,
      defaultSignerSignaturePath: data.default_signer_signature_path,
      defaultSignerSignatureUrl: await certAssetSignedUrl(data.default_signer_signature_path),
      signupBonusLp: data.signup_bonus_lp,
      rewardLpEnrollment: data.reward_lp_enrollment,
      rewardLpCompletion: data.reward_lp_completion,
      rewardLpQuizPass: data.reward_lp_quiz_pass,
    },
  };
}

export async function getLearningSettingsHistory(): Promise<AuditLogRow[]> {
  const res = await getAuditLogPage({ action: "m04.learning_settings.update" }, 1);
  return res.ok ? res.data.rows.slice(0, 10) : [];
}
