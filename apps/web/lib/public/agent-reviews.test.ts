import { describe, expect, it } from "vitest";
import { reviewerLabel, summarizeRatings } from "./agent-reviews";

describe("summarizeRatings", () => {
  it("tanpa ulasan -> rata-rata null", () => {
    expect(summarizeRatings([])).toEqual({ average: null, count: 0 });
  });
  it("membulatkan satu desimal", () => {
    expect(summarizeRatings([5, 5, 4])).toEqual({ average: 4.7, count: 3 });
    expect(summarizeRatings([5])).toEqual({ average: 5, count: 1 });
  });
  it("mengabaikan nilai di luar 1-5", () => {
    expect(summarizeRatings([0, 6, NaN, 4])).toEqual({ average: 4, count: 1 });
  });
});

describe("reviewerLabel", () => {
  it("memakai nama, atau label bawaan bila kosong", () => {
    expect(reviewerLabel("  Budi ")).toBe("Budi");
    expect(reviewerLabel(null)).toBe("Pengguna RumahAgen");
    expect(reviewerLabel("   ")).toBe("Pengguna RumahAgen");
  });
});
