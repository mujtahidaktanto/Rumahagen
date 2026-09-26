import { describe, expect, it } from "vitest";
import {
  canAppealAward,
  canCustomizeTitleSelection,
  titlePresentationRuleText,
  toCreateEvidencePayload,
  validateAppealReason,
  validateSubmitEvidence,
} from "./qualification-rules";

describe("canAppealAward", () => {
  it("hanya revoked dan belum ada banding pending", () => {
    expect(canAppealAward("revoked", false)).toBe(true);
    expect(canAppealAward("revoked", true)).toBe(false);
    for (const s of ["active", "expired", "restored"]) expect(canAppealAward(s, false)).toBe(false);
  });
});

describe("validateAppealReason", () => {
  it("wajib diisi", () => {
    expect(validateAppealReason("")).toBeTruthy();
    expect(validateAppealReason("   ")).toBeTruthy();
    expect(validateAppealReason("Bukti baru ditemukan")).toBeUndefined();
  });
});

describe("validateSubmitEvidence", () => {
  it("referensi bukti wajib", () => {
    expect(validateSubmitEvidence({ titleDefinitionId: "t1", evidenceType: "Sertifikat", sourceType: "upload", sourceReference: "", note: "" })).toEqual({
      sourceReference: "Referensi bukti wajib diisi agar bisa dievaluasi.",
    });
    expect(validateSubmitEvidence({ titleDefinitionId: "t1", evidenceType: "Sertifikat", sourceType: "upload", sourceReference: "DOC-123", note: "" })).toEqual({});
  });
});

describe("toCreateEvidencePayload", () => {
  it("evidence_payload hanya dikirim bila ada isi; user_id ikut badan", () => {
    const f = { titleDefinitionId: "t1", evidenceType: "Sertifikat", sourceType: "upload" as const, sourceReference: " DOC-123 ", note: "" };
    expect(toCreateEvidencePayload("u1", f, null)).toEqual({ user_id: "u1", evidence_type: "Sertifikat", source_type: "upload", source_reference: "DOC-123" });
    expect(toCreateEvidencePayload("u1", { ...f, note: " catatan " }, "Top Performer Regional")).toEqual({
      user_id: "u1",
      evidence_type: "Sertifikat",
      source_type: "upload",
      source_reference: "DOC-123",
      evidence_payload: { target_title: "Top Performer Regional", note: "catatan" },
    });
  });
});

describe("titlePresentationRuleText & canCustomizeTitleSelection", () => {
  it("teks aturan mengikuti jumlah award (set_my_public_titles, 0148)", () => {
    expect(titlePresentationRuleText(0)).toMatch(/belum punya/);
    expect(titlePresentationRuleText(1)).toMatch(/otomatis tampil/);
    expect(titlePresentationRuleText(3)).toMatch(/semuanya tampil/);
    expect(titlePresentationRuleText(6)).toMatch(/maksimal 1 utama/);
  });
  it("kustomisasi hanya di atas 4 award", () => {
    expect(canCustomizeTitleSelection(4)).toBe(false);
    expect(canCustomizeTitleSelection(5)).toBe(true);
  });
});
