import { describe, expect, it } from "vitest";
import { activeFilterCount, listingQuery, parseListingSearch, safeKeyword } from "./listing-params";

describe("parseListingSearch", () => {
  it("bawaan", () => {
    const s = parseListingSearch({});
    expect(s).toMatchObject({ q: "", jenis: [], transaksi: "sale", min: null, max: null, kt: null, km: null, fasilitas: [], urut: "terbaru", tampil: 12 });
  });
  it("menerima nilai valid dan membuang yang tidak valid", () => {
    const s = parseListingSearch({ jenis: ["rumah", "kapal", "rumah"], transaksi: "rent", min: "100", max: "abc", kt: "0", km: "2", urut: "termahal", tampil: "30", fasilitas: ["bukan-uuid"] });
    expect(s.jenis).toEqual(["rumah"]);
    expect(s.transaksi).toBe("rent");
    expect(s.min).toBe(100);
    expect(s.max).toBeNull();
    expect(s.kt).toBeNull();
    expect(s.km).toBe(2);
    expect(s.urut).toBe("termahal");
    expect(s.tampil).toBe(36); // dibulatkan ke kelipatan 12
    expect(s.fasilitas).toEqual([]);
  });
  it("tampil dibatasi 12–96", () => {
    expect(parseListingSearch({ tampil: "5" }).tampil).toBe(12);
    expect(parseListingSearch({ tampil: "5000" }).tampil).toBe(12);
    expect(parseListingSearch({ tampil: "96" }).tampil).toBe(96);
  });
  it("q dipangkas 100 karakter", () => {
    expect(parseListingSearch({ q: "  " + "a".repeat(200) }).q).toHaveLength(100);
  });
});

describe("listingQuery / activeFilterCount / safeKeyword", () => {
  it("nilai bawaan tidak muncul; patch diterapkan", () => {
    const s = parseListingSearch({ jenis: ["rumah", "tanah"], min: "500000000" });
    expect(listingQuery(s)).toBe("?jenis=rumah&jenis=tanah&min=500000000");
    expect(listingQuery(s, { tampil: 24 })).toContain("tampil=24");
    expect(listingQuery(parseListingSearch({}))).toBe("");
  });
  it("hitung filter aktif (jenis transaksi tidak dihitung)", () => {
    expect(activeFilterCount(parseListingSearch({ jenis: ["rumah"], kt: "2", transaksi: "rent" }))).toBe(2);
  });
  it("transaksi bawaan Dijual; hanya 'rent' yang mengubahnya; nilai lain kembali ke Dijual", () => {
    expect(parseListingSearch({}).transaksi).toBe("sale");
    expect(parseListingSearch({ transaksi: "rent" }).transaksi).toBe("rent");
    expect(parseListingSearch({ transaksi: "semua" }).transaksi).toBe("sale");
    expect(listingQuery(parseListingSearch({ transaksi: "rent" }))).toBe("?transaksi=rent");
    expect(listingQuery(parseListingSearch({ transaksi: "rent" }), { transaksi: "sale" })).toBe("");
  });
  it("keyword tidak memuat karakter khusus filter", () => {
    expect(safeKeyword("a,b(c)%d*e")).toBe("a b c d e");
  });
});
