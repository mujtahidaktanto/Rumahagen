import { describe, expect, it } from "vitest";
import { canChangeSlug, finalizeSlug, nextSlugChangeAt, normalizeSlugInput, slugShapeError } from "./slug";

describe("normalizeSlugInput / finalizeSlug", () => {
  it("huruf kecil, spasi jadi tanda hubung, karakter lain dibuang", () => {
    expect(normalizeSlugInput("Andi Pratama  Properti!")).toBe("andi-pratama-properti");
    expect(normalizeSlugInput("andi__pratama")).toBe("andi-pratama");
    expect(normalizeSlugInput("--andi---pratama")).toBe("andi-pratama");
    expect(normalizeSlugInput("andi-")).toBe("andi-");
    expect(finalizeSlug("andi-pratama--")).toBe("andi-pratama");
    expect(normalizeSlugInput("x".repeat(80))).toHaveLength(60);
  });
});

describe("slugShapeError", () => {
  it("bentuk dan panjang", () => {
    expect(slugShapeError("andi-pratama")).toBeNull();
    expect(slugShapeError("ab")).toMatch(/3 sampai 60/);
    expect(slugShapeError("andi--pratama")).toMatch(/huruf kecil/);
    expect(slugShapeError("Andi")).toMatch(/huruf kecil/);
    expect(slugShapeError("-andi")).toMatch(/huruf kecil/);
    expect(slugShapeError("a".repeat(61))).toMatch(/3 sampai 60/);
  });
});

describe("canChangeSlug / nextSlugChangeAt (WIB)", () => {
  const now = new Date("2026-09-26T10:00:00Z");
  it("belum pernah diganti -> boleh", () => {
    expect(canChangeSlug(null, now)).toBe(true);
  });
  it("bulan kalender yang sama -> tidak, bulan lain -> boleh", () => {
    expect(canChangeSlug("2026-09-01T00:00:00Z", now)).toBe(false);
  });
  it("batas bulan mengikuti WIB, bukan UTC", () => {
    // 2026-08-31T17:30Z = 1 Sep 00:30 WIB -> bulan September
    expect(canChangeSlug("2026-08-31T17:30:00Z", now)).toBe(false);
    // 2026-08-31T16:30Z = 31 Agu 23:30 WIB -> bulan Agustus
    expect(canChangeSlug("2026-08-31T16:30:00Z", now)).toBe(true);
    expect(canChangeSlug("2026-08-15T00:00:00Z", now)).toBe(true);
  });
  it("tanggal 1 bulan depan 00:00 WIB (termasuk akhir tahun)", () => {
    expect(nextSlugChangeAt(now).toISOString()).toBe("2026-09-30T17:00:00.000Z");
    expect(nextSlugChangeAt(new Date("2026-12-20T10:00:00Z")).toISOString()).toBe("2026-12-31T17:00:00.000Z");
  });
});
