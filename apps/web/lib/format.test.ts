import { describe, expect, it } from "vitest";
import { formatArea, formatDate, formatListingPrice, formatRupiah } from "./format";

describe("format", () => {
  it("rupiah memakai titik ribuan", () => {
    expect(formatRupiah(850000000)).toBe("Rp 850.000.000");
  });
  it("harga sewa memuat satuan", () => {
    expect(formatListingPrice(5000000, "per_bulan")).toBe("Rp 5.000.000 / bulan");
    expect(formatListingPrice(1200000000, "total")).toBe("Rp 1.200.000.000");
    expect(formatListingPrice(1200000000, null)).toBe("Rp 1.200.000.000");
  });
  it("luas", () => {
    expect(formatArea(120)).toBe("120 m²");
    expect(formatArea(null)).toBeNull();
  });
  it("tanggal zona Jakarta; kosong/tidak valid -> ''", () => {
    expect(formatDate("2026-12-01T03:00:00Z")).toMatch(/^1 \w+ 2026$/);
    expect(formatDate(null)).toBe("");
    expect(formatDate("bukan-tanggal")).toBe("");
  });
});
