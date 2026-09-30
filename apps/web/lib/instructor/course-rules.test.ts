import { describe, expect, it } from "vitest";
import { courseReadinessBlockReason, isCourseReady, validateCourseForm, EMPTY_COURSE } from "./course-rules";

describe("isCourseReady", () => {
  it("belum siap tanpa pelajaran", () => {
    expect(isCourseReady(0, [{ title: "Kuis", ready: true, problems: [] }])).toBe(false);
  });
  it("belum siap tanpa kuis", () => {
    expect(isCourseReady(2, [])).toBe(false);
  });
  it("belum siap bila ada kuis belum siap", () => {
    expect(isCourseReady(1, [{ title: "Kuis", ready: false, problems: ["Minimal 2 opsi jawaban."] }])).toBe(false);
  });
  it("siap bila ada pelajaran dan semua kuis siap", () => {
    expect(isCourseReady(1, [{ title: "Kuis", ready: true, problems: [] }])).toBe(true);
  });
});

describe("courseReadinessBlockReason", () => {
  it("minta pelajaran dulu", () => {
    expect(courseReadinessBlockReason(0, [])).toBe("Tambahkan minimal 1 pelajaran dulu.");
  });
  it("minta kuis dulu", () => {
    expect(courseReadinessBlockReason(1, [])).toBe("Tambahkan minimal 1 kuis yang siap dulu.");
  });
  it("sebut kuis bermasalah", () => {
    expect(courseReadinessBlockReason(1, [{ title: "Kuis A", ready: false, problems: ["Belum ada opsi yang ditandai benar."] }])).toBe('Perbaiki kuis "Kuis A": Belum ada opsi yang ditandai benar..');
  });
});

describe("validateCourseForm", () => {
  it("menolak judul kosong", () => {
    expect(validateCourseForm(EMPTY_COURSE)).toBe(false);
  });
  it("menolak nilai lulus di luar 0-100", () => {
    expect(validateCourseForm({ ...EMPTY_COURSE, title: "Kursus A", passingGrade: "150" })).toBe(false);
  });
  it("menerima form valid", () => {
    expect(validateCourseForm({ ...EMPTY_COURSE, title: "Kursus A" })).toBe(true);
  });
});
