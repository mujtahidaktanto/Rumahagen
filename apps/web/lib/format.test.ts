import { describe, expect, it } from "vitest";
import { dateBox, formatArea, formatDate, formatDateLong, formatDateTime, formatTimeRange, formatListingPrice, formatPriceRange, formatRupiah, whatsappUrl } from "./format";

describe("format", () => {
  it("rupiah memakai titik ribuan", () => {
    expect(formatRupiah(850000000)).toBe("Rp 850.000.000");
  });
  it("harga sewa memuat satuan", () => {
    expect(formatListingPrice(5000000, "per_bulan")).toBe("Rp 5.000.000 / bulan");
    expect(formatListingPrice(1200000000, "total")).toBe("Rp 1.200.000.000");
    expect(formatListingPrice(1200000000, null)).toBe("Rp 1.200.000.000");
  });
  it("rentang harga proyek", () => {
    expect(formatPriceRange(650000000, 950000000, "total")).toBe("Rp 650.000.000 – Rp 950.000.000");
    expect(formatPriceRange(450000000, 450000000, null)).toBe("Rp 450.000.000");
    expect(formatPriceRange(450000000, null, null)).toBe("Mulai Rp 450.000.000");
    expect(formatPriceRange(null, 900000000, null)).toBe("Hingga Rp 900.000.000");
    expect(formatPriceRange(3000000, 5000000, "per_bulan")).toBe("Rp 3.000.000 – Rp 5.000.000 / bulan");
    expect(formatPriceRange(null, null, "total")).toBe("Hubungi developer");
  });
  it("luas", () => {
    expect(formatArea(120)).toBe("120 m²");
    expect(formatArea(null)).toBeNull();
  });
  it("tanggal dan jam WIB", () => {
    expect(formatDateTime("2026-10-18T12:00:00Z")).toMatch(/^18 \w+ 2026 · 19\.00 WIB$/);
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime("x")).toBe("");
  });
  it("tanggal panjang, rentang jam, dan kotak tanggal", () => {
    expect(formatDateLong("2026-10-18T12:00:00Z")).toBe("Minggu, 18 Oktober 2026");
    expect(formatDateLong(null)).toBe("");
    expect(formatTimeRange("2026-10-18T12:00:00Z", "2026-10-18T14:30:00Z")).toBe("19.00 – 21.30 WIB");
    expect(formatTimeRange("2026-10-18T12:00:00Z")).toBe("19.00 WIB");
    expect(formatTimeRange("x")).toBe("");
    expect(dateBox("2026-10-18T12:00:00Z")).toEqual({ month: "OKT", day: "18" });
    expect(dateBox(null)).toEqual({ month: "", day: "" });
  });
  it("URL WhatsApp dari berbagai format nomor", () => {
    expect(whatsappUrl("0812-3456-7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappUrl("+62 812 3456 7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappUrl("6281234567890", "Halo")).toBe("https://wa.me/6281234567890?text=Halo");
    expect(whatsappUrl("81234567890")).toBe("https://wa.me/6281234567890");
    expect(whatsappUrl("123")).toBeNull();
    expect(whatsappUrl("abc")).toBeNull();
    expect(whatsappUrl(null)).toBeNull();
  });
  it("tanggal zona Jakarta; kosong/tidak valid -> ''", () => {
    expect(formatDate("2026-12-01T03:00:00Z")).toMatch(/^1 \w+ 2026$/);
    expect(formatDate(null)).toBe("");
    expect(formatDate("bukan-tanggal")).toBe("");
  });
});
