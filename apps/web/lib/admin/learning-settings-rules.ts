// lib/admin/learning-settings-rules.ts — aturan murni Konfigurasi Belajar (M04, wireframe 02-Admin/M04-Konfigurasi-Belajar). Batas angka sama persis dengan learningSettingsPatchSchema
// (lib/validation/learning-settings.ts) dan CHECK di database (migration 0150) — validasi di sini hanya membantu UX, server tetap penentu akhir.
export type LearningSettingsForm = {
  batasAktif: boolean;
  maxAttempts: string;
  cooldownMinutes: string;
  autoIssue: boolean;
  template: string;
  signerName: string;
  signerTitle: string;
  signerSignaturePath: string | null;
  signupBonusLp: string;
  rewardEnrollment: string;
  rewardCompletion: string;
  rewardQuizPass: string;
};

export type LearningSettingsErrors = Partial<Record<"maxAttempts" | "cooldownMinutes" | "signerName" | "signerTitle" | "signupBonusLp" | "rewardEnrollment" | "rewardCompletion" | "rewardQuizPass", string>>;

const intInRange = (v: string, min: number, max: number) => {
  const n = Number(v.trim());
  return v.trim() !== "" && Number.isInteger(n) && n >= min && n <= max;
};
const lpInRange = (v: string) => {
  const n = Number(v.trim());
  return v.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 1_000_000;
};

export function validateLearningSettings(f: LearningSettingsForm): LearningSettingsErrors {
  const errors: LearningSettingsErrors = {};
  if (f.batasAktif && !intInRange(f.maxAttempts, 1, 1000)) errors.maxAttempts = "Angka 1–1.000.";
  if (!intInRange(f.cooldownMinutes, 0, 10_080)) errors.cooldownMinutes = "0 berarti tanpa jeda. Maksimal 10.080 menit (7 hari).";
  if (!f.signerName.trim()) errors.signerName = "Wajib diisi.";
  if (!f.signerTitle.trim()) errors.signerTitle = "Wajib diisi.";
  if (!lpInRange(f.signupBonusLp)) errors.signupBonusLp = "Angka 0–1.000.000.";
  if (!lpInRange(f.rewardEnrollment)) errors.rewardEnrollment = "Angka 0–1.000.000.";
  if (!lpInRange(f.rewardCompletion)) errors.rewardCompletion = "Angka 0–1.000.000.";
  if (!lpInRange(f.rewardQuizPass)) errors.rewardQuizPass = "Angka 0–1.000.000.";
  return errors;
}

/** Ringkasan angka untuk kartu di tab Umum (sumAuto/sumBonus/sumTpl/sumRule pada wireframe). */
export function summaryLine(f: LearningSettingsForm, templateLabel: string): { autoIssue: string; bonus: string; template: string; rule: string } {
  return {
    autoIssue: f.autoIssue ? "Otomatis" : "Manual",
    bonus: `${f.signupBonusLp} LP`,
    template: templateLabel,
    rule: f.batasAktif ? `${f.maxAttempts}× · jeda ${f.cooldownMinutes} menit` : "Tanpa batas",
  };
}
