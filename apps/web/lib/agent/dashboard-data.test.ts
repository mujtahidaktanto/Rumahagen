import { describe, expect, it } from "vitest";
import { monthRangeWIB, relativeTimeId, todayWIB } from "./dashboard-data";

describe("todayWIB / monthRangeWIB", () => {
  it("memakai tanggal kalender WIB, bukan UTC", () => {
    // 2026-09-30 18:00 UTC = 2026-10-01 01:00 WIB
    expect(todayWIB(new Date("2026-09-30T18:00:00Z"))).toBe("2026-10-01");
    expect(monthRangeWIB(new Date("2026-09-30T18:00:00Z"))).toEqual({ from: "2026-10-01", to: "2026-10-01" });
    expect(monthRangeWIB(new Date("2026-09-26T03:00:00Z"))).toEqual({ from: "2026-09-01", to: "2026-09-26" });
  });
});

describe("relativeTimeId", () => {
  const now = new Date("2026-09-26T10:00:00Z"); // 17.00 WIB
  it("menit, jam, kemarin, hari", () => {
    expect(relativeTimeId("2026-09-26T09:59:40Z", now)).toBe("Baru saja");
    expect(relativeTimeId("2026-09-26T09:48:00Z", now)).toBe("12 menit lalu");
    expect(relativeTimeId("2026-09-26T08:30:00Z", now)).toBe("1 jam lalu");
    expect(relativeTimeId("2026-09-25T10:00:00Z", now)).toBe("Kemarin");
    expect(relativeTimeId("2026-09-23T10:00:00Z", now)).toBe("3 hari lalu");
  });
  it("lewat seminggu -> tanggal; tanggal tidak valid -> kosong", () => {
    expect(relativeTimeId("2026-09-01T10:00:00Z", now)).toMatch(/2026/);
    expect(relativeTimeId("bukan-tanggal", now)).toBe("");
  });
  it("malam WIB yang sudah beda hari kalender disebut kemarin", () => {
    // sekarang 00.30 WIB (17:30 UTC hari sebelumnya), kejadian 23.00 WIB kemarin = 90 menit lalu tetapi beda hari
    expect(relativeTimeId("2026-09-25T16:00:00Z", new Date("2026-09-25T17:30:00Z"))).toBe("Kemarin");
  });
});
