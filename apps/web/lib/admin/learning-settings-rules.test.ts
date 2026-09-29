import { describe, expect, it } from "vitest";
import { validateLearningSettings, summaryLine, type LearningSettingsForm } from "./learning-settings-rules";

const ok: LearningSettingsForm = {
  batasAktif: true,
  maxAttempts: "3",
  cooldownMinutes: "60",
  autoIssue: true,
  template: "classic",
  signerName: "Mujtahid Aktanto",
  signerTitle: "CEO RumahAgen",
  signerSignaturePath: null,
  signupBonusLp: "25",
  rewardEnrollment: "0",
  rewardCompletion: "0",
  rewardQuizPass: "0",
};

describe("validateLearningSettings", () => {
  it("isian valid tanpa galat", () => {
    expect(validateLearningSettings(ok)).toEqual({});
  });
  it("max attempts hanya diperiksa bila batasAktif", () => {
    expect(validateLearningSettings({ ...ok, maxAttempts: "" }).maxAttempts).toBeDefined();
    expect(validateLearningSettings({ ...ok, maxAttempts: "0" }).maxAttempts).toBeDefined();
    expect(validateLearningSettings({ ...ok, maxAttempts: "1001" }).maxAttempts).toBeDefined();
    expect(validateLearningSettings({ ...ok, batasAktif: false, maxAttempts: "" }).maxAttempts).toBeUndefined();
  });
  it("cooldown 0-10080, selalu diperiksa", () => {
    expect(validateLearningSettings({ ...ok, cooldownMinutes: "0" }).cooldownMinutes).toBeUndefined();
    expect(validateLearningSettings({ ...ok, cooldownMinutes: "10080" }).cooldownMinutes).toBeUndefined();
    expect(validateLearningSettings({ ...ok, cooldownMinutes: "10081" }).cooldownMinutes).toBeDefined();
    expect(validateLearningSettings({ ...ok, cooldownMinutes: "-1" }).cooldownMinutes).toBeDefined();
  });
  it("nama dan jabatan penandatangan wajib", () => {
    expect(validateLearningSettings({ ...ok, signerName: "  " }).signerName).toBeDefined();
    expect(validateLearningSettings({ ...ok, signerTitle: "" }).signerTitle).toBeDefined();
  });
  it("LP 0-1.000.000", () => {
    expect(validateLearningSettings({ ...ok, signupBonusLp: "-1" }).signupBonusLp).toBeDefined();
    expect(validateLearningSettings({ ...ok, rewardEnrollment: "1000001" }).rewardEnrollment).toBeDefined();
    expect(validateLearningSettings({ ...ok, rewardQuizPass: "1000000" }).rewardQuizPass).toBeUndefined();
  });
});

describe("summaryLine", () => {
  it("merangkum nilai untuk kartu Umum", () => {
    expect(summaryLine(ok, "Klasik Elegan")).toEqual({ autoIssue: "Otomatis", bonus: "25 LP", template: "Klasik Elegan", rule: "3× · jeda 60 menit" });
    expect(summaryLine({ ...ok, batasAktif: false, autoIssue: false }, "Modern Minimalis").rule).toBe("Tanpa batas");
  });
});
