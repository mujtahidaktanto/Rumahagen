import { describe, expect, it } from "vitest";
import { analyticsHref, exportHref, formatUnit, parseAnalyticsSearch, previousOf } from "./analytics-view";

describe("parseAnalyticsSearch", () => {
  const today = "2026-09-30";

  it("bawaan 30 hari terakhir", () => {
    const s = parseAnalyticsSearch({}, today);
    expect(s).toMatchObject({ rentang: "30", from: "2026-09-01", to: "2026-09-30", compare: true });
  });

  it("preset 7 hari", () => {
    const s = parseAnalyticsSearch({ rentang: "7" }, today);
    expect(s.from).toBe("2026-09-24");
    expect(s.to).toBe(today);
  });

  it("preset bulan ini", () => {
    const s = parseAnalyticsSearch({ rentang: "bulan" }, today);
    expect(s.from).toBe("2026-09-01");
  });

  it("kustom valid", () => {
    const s = parseAnalyticsSearch({ rentang: "kustom", dari: "2026-08-01", sampai: "2026-08-15" }, today);
    expect(s).toMatchObject({ rentang: "kustom", from: "2026-08-01", to: "2026-08-15", customInvalid: false });
  });

  it("kustom tidak valid (awal setelah akhir) kembali ke 30 hari", () => {
    const s = parseAnalyticsSearch({ rentang: "kustom", dari: "2026-08-15", sampai: "2026-08-01" }, today);
    expect(s.rentang).toBe("30");
    expect(s.customInvalid).toBe(true);
  });

  it("bandingkan=0 mematikan perbandingan", () => {
    const s = parseAnalyticsSearch({ bandingkan: "0" }, today);
    expect(s.compare).toBe(false);
  });
});

describe("analyticsHref", () => {
  it("bawaan tanpa query string", () => {
    const s = parseAnalyticsSearch({}, "2026-09-30");
    expect(analyticsHref(s)).toBe("/admin");
  });

  it("mencatat rentang non-bawaan", () => {
    const s = parseAnalyticsSearch({ rentang: "7" }, "2026-09-30");
    expect(analyticsHref(s)).toBe("/admin?rentang=7");
  });
});

describe("exportHref", () => {
  it("menyertakan format, rentang, dan perbandingan", () => {
    const s = parseAnalyticsSearch({}, "2026-09-30");
    expect(exportHref(s, "xlsx")).toBe("/api/admin/analytics/export?format=xlsx&from=2026-09-01&to=2026-09-30&compare=true");
  });
});

describe("previousOf", () => {
  it("periode sebelumnya dengan panjang sama", () => {
    const s = parseAnalyticsSearch({ rentang: "7" }, "2026-09-30");
    expect(previousOf(s)).toEqual({ from: "2026-09-17", to: "2026-09-23" });
  });
});

describe("formatUnit", () => {
  it("int pakai pemisah ribuan", () => {
    expect(formatUnit(12345, "int")).toBe("12.345");
  });
  it("idr pakai format rupiah", () => {
    expect(formatUnit(1000000, "idr")).toContain("Rp");
  });
  it("pct pakai persen", () => {
    expect(formatUnit(12.34, "pct")).toBe("12,3%");
  });
  it("days pakai satuan hari", () => {
    expect(formatUnit(2.5, "days")).toBe("2,5 hari");
  });
  it("null jadi strip", () => {
    expect(formatUnit(null, "int")).toBe("—");
  });
});
