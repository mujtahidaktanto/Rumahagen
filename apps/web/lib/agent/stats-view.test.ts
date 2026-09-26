import { describe, expect, it } from "vitest";
import { compareLabel, conversion, dbrRows, deltaView, exportHref, listingStatusRows, parseStatsSearch, pipelineRows, rangeLabel, refreshUsage, sparkGeometry, statsHref } from "./stats-view";

const TODAY = "2026-09-26";
const ORG1 = "0db7b607-a7fa-41af-adbf-052707bf79fc";
const ORG2 = "7d1b1c5e-3d2a-4f0a-9d6b-1f4a8e2c9b10";

describe("parseStatsSearch", () => {
  it("bawaan 30 hari berakhir hari ini dengan perbandingan", () => {
    expect(parseStatsSearch({}, TODAY)).toMatchObject({ rentang: "30", from: "2026-08-28", to: TODAY, compare: true, org: null, customInvalid: false });
  });
  it("preset 7, 14, dan bulan ini", () => {
    expect(parseStatsSearch({ rentang: "7" }, TODAY).from).toBe("2026-09-20");
    expect(parseStatsSearch({ rentang: "14" }, TODAY).from).toBe("2026-09-13");
    expect(parseStatsSearch({ rentang: "bulan" }, TODAY).from).toBe("2026-09-01");
    expect(parseStatsSearch({ rentang: "aneh" }, TODAY).rentang).toBe("30");
  });
  it("rentang kustom valid, dijepit ke hari ini, dan batas 120 hari", () => {
    expect(parseStatsSearch({ rentang: "kustom", dari: "2026-08-01", sampai: "2026-09-10" }, TODAY)).toMatchObject({ rentang: "kustom", from: "2026-08-01", to: "2026-09-10" });
    expect(parseStatsSearch({ rentang: "kustom", dari: "2026-09-01", sampai: "2027-01-01" }, TODAY).to).toBe(TODAY);
    const long = parseStatsSearch({ rentang: "kustom", dari: "2026-01-01", sampai: "2026-09-10" }, TODAY);
    expect(long.customInvalid).toBe(true);
    expect(long.rentang).toBe("30");
    expect(parseStatsSearch({ rentang: "kustom", dari: "2026-09-10", sampai: "2026-09-01" }, TODAY).customInvalid).toBe(true);
    expect(parseStatsSearch({ rentang: "kustom", dari: "2026-02-31", sampai: "2026-03-05" }, TODAY).customInvalid).toBe(true);
    expect(parseStatsSearch({ rentang: "kustom" }, TODAY).customInvalid).toBe(true);
  });
  it("perbandingan dan cakupan organisasi hanya untuk pemimpin", () => {
    expect(parseStatsSearch({ bandingkan: "0" }, TODAY).compare).toBe(false);
    expect(parseStatsSearch({ cakupan: "organisasi" }, TODAY, []).org).toBeNull();
    expect(parseStatsSearch({ cakupan: "organisasi" }, TODAY, [ORG1, ORG2]).org).toBe(ORG1);
    expect(parseStatsSearch({ cakupan: "organisasi" }, TODAY, [ORG1, ORG2], ORG2).org).toBe(ORG2);
    expect(parseStatsSearch({ cakupan: "organisasi", org: ORG2 }, TODAY, [ORG1, ORG2]).org).toBe(ORG2);
    expect(parseStatsSearch({ cakupan: "organisasi", org: "bukan-milik-saya" }, TODAY, [ORG1]).org).toBe(ORG1);
  });
});

describe("tautan", () => {
  it("hanya nilai bukan bawaan", () => {
    const s = parseStatsSearch({}, TODAY);
    expect(statsHref(s)).toBe("/agent/statistik");
    expect(statsHref(s, { rentang: "7" })).toBe("/agent/statistik?rentang=7");
    expect(statsHref(s, { compare: false })).toBe("/agent/statistik?bandingkan=0");
    expect(statsHref(s, { rentang: "kustom", dari: "2026-09-01", sampai: "2026-09-10" })).toBe("/agent/statistik?rentang=kustom&dari=2026-09-01&sampai=2026-09-10");
    expect(statsHref(s, { org: ORG1 })).toBe(`/agent/statistik?cakupan=organisasi&org=${ORG1}`);
  });
  it("ekspor memakai rentang eksplisit dan organisasi bila ada", () => {
    const s = parseStatsSearch({ rentang: "7", bandingkan: "0" }, TODAY);
    expect(exportHref(s, "xlsx")).toBe("/api/agents/me/statistics/export?format=xlsx&from=2026-09-20&to=2026-09-26&compare=false");
    expect(exportHref({ ...s, org: ORG1 }, "pdf")).toContain(`organization_id=${ORG1}`);
  });
  it("label rentang", () => {
    expect(rangeLabel("2026-09-01", "2026-09-26")).toBe("1 Sep 2026 – 26 Sep 2026 (26 hari)");
    expect(compareLabel({ from: "2026-08-06", to: "2026-08-31" })).toBe("Dibanding 6 Agu 2026 – 31 Agu 2026");
    expect(compareLabel(null)).toBe("Tanpa perbandingan");
  });
});

describe("grafik dan angka", () => {
  it("jalur bermula dari 0 dengan skala bersama; kosong = jalur kosong", () => {
    const g = sparkGeometry([0, 10, 5], [10, 10, 10], 100, 50, 5);
    expect(g.max).toBe(10);
    expect(g.line.startsWith("M0.0 45.0")).toBe(true); // nilai 0 di dasar
    expect(g.line).toContain("L50.0 5.0"); // nilai 10 (maks) di atas
    expect(g.prev).not.toBeNull();
    expect(g.area.endsWith("Z")).toBe(true);
    expect(sparkGeometry([], null).line).toBe("");
    expect(sparkGeometry([0, 0], null).line).toBe("M0.0 84.0 L320.0 84.0");
    expect(sparkGeometry([5], null).line).toBe("M0.0 6.0");
  });
  it("perubahan persen", () => {
    expect(deltaView(null)).toBeNull();
    expect(deltaView(12.34)).toEqual({ text: "▲ 12,3%", tone: "success" });
    expect(deltaView(-8)).toEqual({ text: "▼ 8%", tone: "danger" });
    expect(deltaView(0)).toEqual({ text: "0%", tone: "neutral" });
    expect(deltaView(NaN)).toBeNull();
  });
  it("konversi dan pemakaian refresh", () => {
    expect(conversion(5, 100)).toBe(5);
    expect(conversion(5, 0)).toBeNull();
    expect(refreshUsage({ allowance: 10, used_today: 7 })).toEqual({ used: 7, allow: 10, pct: 70 });
    expect(refreshUsage({ allowance: 0, used_today: 0 }).pct).toBe(0);
    expect(refreshUsage({ allowance: 5, used_today: 9 }).pct).toBe(100);
  });
});

describe("baris pipeline dan status", () => {
  it("pipeline berurutan tetap, persentase dari total, status asing ikut", () => {
    const r = pipelineRows({ contacted: 5, new: 5, converted: 0, lost: 0, misterius: 10 });
    expect(r.map((x) => x.key)).toEqual(["new", "contacted", "converted", "lost", "misterius"]);
    expect(r[0]).toMatchObject({ label: "Baru", count: 5, share: 25 });
    expect(r[4]).toMatchObject({ label: "misterius", share: 50 });
    expect(pipelineRows({}).every((x) => x.share === 0)).toBe(true);
  });
  it("kondisi listing hanya yang punya listing, lebar relatif ke terbanyak", () => {
    const r = listingStatusRows({ published: 18, draft: 2, sold: 0, aneh: 3 });
    expect(r.map((x) => x.key)).toEqual(["published", "draft", "aneh"]);
    expect(r[0]).toMatchObject({ label: "Dipublikasikan", share: 100 });
    expect(r[1]!.share).toBeCloseTo(11.11, 1);
    expect(listingStatusRows({})).toEqual([]);
  });
  it("DBR membagi menurut hasil", () => {
    const r = dbrRows({ layak: 7, perlu_review: 3, tidak_layak: 0 });
    expect(r.map((x) => x.count)).toEqual([7, 3, 0]);
    expect(r[0]!.share).toBe(70);
    expect(dbrRows({ layak: 0, perlu_review: 0, tidak_layak: 0 }).every((x) => x.share === 0)).toBe(true);
  });
});
