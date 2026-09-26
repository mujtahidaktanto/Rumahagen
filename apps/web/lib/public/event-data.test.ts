import { describe, expect, it } from "vitest";
import { eventQuery, isEventId, isEventPast, parseEventSearch } from "./event-data";

describe("parseEventSearch / eventQuery", () => {
  it("bawaan: akan datang", () => {
    expect(parseEventSearch({})).toEqual({ q: "", kategori: null, waktu: "akan_datang", tampil: 12 });
  });
  it("nilai tidak valid kembali ke bawaan; valid diterima", () => {
    expect(parseEventSearch({ kategori: "konser", waktu: "besok", tampil: "5" })).toEqual({ q: "", kategori: null, waktu: "akan_datang", tampil: 12 });
    const s = parseEventSearch({ q: " expo ", kategori: "open_house", waktu: "lalu", tampil: "30" });
    expect(s).toEqual({ q: "expo", kategori: "open_house", waktu: "lalu", tampil: 36 });
    expect(eventQuery(parseEventSearch({}))).toBe("");
    expect(eventQuery(s, { tampil: 12 })).toBe("?q=expo&kategori=open_house&waktu=lalu");
  });
});

describe("isEventId / isEventPast", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  it("uuid", () => {
    expect(isEventId("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isEventId("bukan")).toBe(false);
  });
  it("lampau bila selesai < sekarang; tanpa jam selesai memakai jam mulai", () => {
    expect(isEventPast({ start_at: "2026-10-01T00:00:00Z", end_at: "2026-10-02T00:00:00Z" }, now)).toBe(true);
    expect(isEventPast({ start_at: "2026-10-09T00:00:00Z", end_at: "2026-10-11T00:00:00Z" }, now)).toBe(false);
    expect(isEventPast({ start_at: "2026-10-09T00:00:00Z", end_at: null }, now)).toBe(true);
    expect(isEventPast({ start_at: "2026-10-20T00:00:00Z", end_at: null }, now)).toBe(false);
  });
});
