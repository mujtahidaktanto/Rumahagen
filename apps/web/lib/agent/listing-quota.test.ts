import { describe, expect, it } from "vitest";
import { bucketPercent, bucketTone, formatResetWIB, listingQuotaNote, quotaLevel } from "./listing-quota";
import { myListingsQuery, parseMyListingsSearch } from "./listing-params";

describe("quotaLevel / bucket", () => {
  it("penuh, hampir habis, tersedia", () => {
    expect(quotaLevel(0)).toBe("penuh");
    expect(quotaLevel(-1)).toBe("penuh");
    expect(quotaLevel(3)).toBe("hampir_habis");
    expect(quotaLevel(4)).toBe("tersedia");
  });
  it("persen dan warna bilah", () => {
    expect(bucketPercent(23, 25)).toBe(92);
    expect(bucketPercent(30, 25)).toBe(100);
    expect(bucketPercent(0, 0)).toBe(0);
    expect(bucketTone(25, 25)).toBe("danger");
    expect(bucketTone(22, 25)).toBe("warning");
    expect(bucketTone(7, 25)).toBe("blue");
  });
});

describe("formatResetWIB", () => {
  it("memakai zona WIB", () => {
    expect(formatResetWIB("2026-09-30T17:00:00Z")).toBe("1 Okt 2026 00:00 WIB");
    expect(formatResetWIB(null)).toBe("");
    expect(formatResetWIB("x")).toBe("");
  });
});

describe("listingQuotaNote", () => {
  const now = new Date("2026-10-23T00:00:00Z");
  it("published: sisa hari, masa tenggang, atau tanpa catatan", () => {
    expect(listingQuotaNote({ status: "published" }, { validUntil: "2026-12-23T00:00:00Z", graceUntil: "2026-12-30T00:00:00Z" }, false, now)).toMatchObject({ tone: "normal", text: expect.stringContaining("61 hari lagi") });
    expect(listingQuotaNote({ status: "published" }, { validUntil: "2026-10-01T00:00:00Z", graceUntil: "2026-10-30T00:00:00Z" }, false, now)).toMatchObject({ tone: "warn" });
    expect(listingQuotaNote({ status: "published" }, { validUntil: "2026-10-01T00:00:00Z", graceUntil: "2026-10-08T00:00:00Z" }, false, now)).toBeNull();
    expect(listingQuotaNote({ status: "published" }, null, false, now)).toBeNull();
  });
  it("draft: kuota tersedia atau habis", () => {
    expect(listingQuotaNote({ status: "draft" }, null, false, now)?.text).toMatch(/memakai 1 jatah/);
    expect(listingQuotaNote({ status: "draft" }, null, true, now)).toMatchObject({ tone: "danger" });
  });
  it("status lain tanpa catatan", () => {
    expect(listingQuotaNote({ status: "sold" }, null, false, now)).toBeNull();
  });
});

describe("parseMyListingsSearch / myListingsQuery", () => {
  it("status sah, tampil dibulatkan, bawaan", () => {
    expect(parseMyListingsSearch({})).toEqual({ status: "semua", tampil: 12 });
    expect(parseMyListingsSearch({ status: "draft", tampil: "30" })).toEqual({ status: "draft", tampil: 36 });
    expect(parseMyListingsSearch({ status: "hack", tampil: "9999" })).toEqual({ status: "semua", tampil: 12 });
  });
  it("query menghilangkan nilai bawaan", () => {
    expect(myListingsQuery({ status: "semua", tampil: 12 })).toBe("");
    expect(myListingsQuery({ status: "draft", tampil: 12 }, { tampil: 24 })).toBe("?status=draft&tampil=24");
  });
});
