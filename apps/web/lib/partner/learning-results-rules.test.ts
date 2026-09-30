import { describe, expect, it } from "vitest";
import { EMPTY_LEARNING_RESULT, validateLearningResultForm, validationStatus } from "./learning-results-rules";

describe("validateLearningResultForm", () => {
  it("jenis hasil, asal data, dan referensi wajib", () => {
    const errs = validateLearningResultForm(EMPTY_LEARNING_RESULT);
    expect(errs.resultType).toBeDefined();
    expect(errs.provenanceSource).toBeDefined();
    expect(errs.provenanceReference).toBeDefined();
  });
  it("session id opsional, tapi harus UUID bila diisi", () => {
    const base = { ...EMPTY_LEARNING_RESULT, resultType: "Pelatihan", provenanceSource: "Zoom", provenanceReference: "rekaman-1" };
    expect(validateLearningResultForm({ ...base, sessionId: "bukan-uuid" }).sessionId).toBeDefined();
    expect(validateLearningResultForm({ ...base, sessionId: "" }).sessionId).toBeUndefined();
    expect(validateLearningResultForm({ ...base, sessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }).sessionId).toBeUndefined();
  });
  it("data tambahan harus objek JSON valid bila diisi", () => {
    const base = { ...EMPTY_LEARNING_RESULT, resultType: "Pelatihan", provenanceSource: "Zoom", provenanceReference: "rekaman-1" };
    expect(validateLearningResultForm({ ...base, resultPayload: "{bukan json" }).resultPayload).toBeDefined();
    expect(validateLearningResultForm({ ...base, resultPayload: "[1,2,3]" }).resultPayload).toBeDefined();
    expect(validateLearningResultForm({ ...base, resultPayload: '{"peserta":20}' }).resultPayload).toBeUndefined();
  });
});

describe("validationStatus", () => {
  it("3 nilai CHECK; tak dikenal jatuh ke label apa adanya", () => {
    for (const s of ["pending", "validated", "rejected"]) expect(validationStatus(s).label).not.toBe(s);
    expect(validationStatus("aneh").label).toBe("aneh");
  });
});
