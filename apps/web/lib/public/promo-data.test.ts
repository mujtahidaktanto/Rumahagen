import { describe, expect, it } from "vitest";
import { expiryLabel, safeHref, validityText } from "./promo-data";

describe("safeHref", () => {
  it("menerima jalur situs dan https", () => {
    expect(safeHref("/listing/abc")).toBe("/listing/abc");
    expect(safeHref("https://contoh.com/x")).toBe("https://contoh.com/x");
  });
  it("menolak skema berbahaya, protokol-relatif, http polos, dan kosong", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("//evil.com")).toBeNull();
    expect(safeHref("http://contoh.com")).toBeNull();
    expect(safeHref("data:text/html,x")).toBeNull();
    expect(safeHref("")).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});

describe("expiryLabel", () => {
  const now = new Date("2026-09-10T03:00:00Z");
  it("tanpa batas / hari ini / besok / dalam N hari / tanggal", () => {
    expect(expiryLabel(null, now)).toBe("Tanpa batas waktu");
    expect(expiryLabel("2026-09-10T10:00:00Z", now)).toBe("Berakhir hari ini");
    expect(expiryLabel("2026-09-11T03:00:00Z", now)).toBe("Berakhir besok");
    expect(expiryLabel("2026-09-09T10:00:00Z", now)).toBe("Berakhir hari ini");
    expect(expiryLabel("2026-09-14T03:00:00Z", now)).toBe("Berakhir dalam 4 hari");
    expect(expiryLabel("2026-10-30T03:00:00Z", now)).toMatch(/^Berakhir 30 \w+ 2026$/);
  });
});

describe("validityText", () => {
  it("rentang, satu sisi, dan kosong", () => {
    expect(validityText({ schedule_at: "2026-09-01T00:00:00Z", expires_at: "2026-09-30T00:00:00Z" })).toMatch(/^1 \w+ 2026 – 30 \w+ 2026$/);
    expect(validityText({ schedule_at: null, expires_at: "2026-09-30T00:00:00Z" })).toMatch(/^Hingga 30/);
    expect(validityText({ schedule_at: null, expires_at: null })).toBe("Tanpa batas waktu");
  });
});
