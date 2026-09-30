import { describe, expect, it } from "vitest";
import { EMPTY_SESSION, sessionStatus, validateSessionForm } from "./session-rules";

describe("validateSessionForm", () => {
  it("waktu mulai wajib", () => {
    expect(validateSessionForm(EMPTY_SESSION).startAt).toBeDefined();
  });
  it("waktu selesai harus setelah waktu mulai", () => {
    const f = { ...EMPTY_SESSION, startAt: "2026-10-01T10:00", endAt: "2026-10-01T09:00" };
    expect(validateSessionForm(f).endAt).toBeDefined();
  });
  it("lolos bila valid", () => {
    const f = { ...EMPTY_SESSION, startAt: "2026-10-01T10:00", endAt: "2026-10-01T12:00" };
    expect(validateSessionForm(f)).toEqual({});
  });
});

describe("sessionStatus", () => {
  it("6 nilai CHECK; tak dikenal jatuh ke label apa adanya", () => {
    for (const s of ["draft", "scheduled", "live", "ended", "cancelled", "failed"]) expect(sessionStatus(s).label).not.toBe(s);
    expect(sessionStatus("aneh").label).toBe("aneh");
  });
});
