import { describe, expect, it } from "vitest";
import { courseQuery, isUuid, parseCourseSearch, sessionTitle } from "./learning-data";

describe("parseCourseSearch / courseQuery", () => {
  it("bawaan", () => {
    expect(parseCourseSearch({})).toEqual({ kategori: null, q: "", tampil: 12 });
  });
  it("kategori valid diterima, tidak valid dibuang; tampil dibulatkan/dibatasi", () => {
    expect(parseCourseSearch({ kategori: "financial_kpr" }).kategori).toBe("financial_kpr");
    expect(parseCourseSearch({ kategori: "acak" }).kategori).toBeNull();
    expect(parseCourseSearch({ tampil: "30" }).tampil).toBe(36);
    expect(parseCourseSearch({ tampil: "5000" }).tampil).toBe(12);
  });
  it("query string tanpa nilai bawaan", () => {
    expect(courseQuery(parseCourseSearch({}))).toBe("");
    expect(courseQuery(parseCourseSearch({ q: "kpr", kategori: "financial_kpr" }), { tampil: 24 })).toBe("?q=kpr&kategori=financial_kpr&tampil=24");
  });
});

describe("isUuid / sessionTitle", () => {
  it("uuid", () => {
    expect(isUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isUuid("bukan")).toBe(false);
  });
  it("judul sesi dari kursus atau tipe", () => {
    expect(sessionTitle({ courseTitle: "Dasar DBR", session_type: "broadcast" })).toBe("Dasar DBR");
    expect(sessionTitle({ courseTitle: null, session_type: "on_demand" })).toBe("Sesi On-Demand");
  });
});
