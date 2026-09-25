import { describe, expect, it } from "vitest";
import { buildListingWhatsAppMessage, listingCode } from "./whatsapp-message";

const base = {
  agentName: "Rian Saputra",
  title: "Rumah Minimalis Modern 2 Lantai",
  slug: "rumah-minimalis-a1b2c3",
  id: "1a2b3c4d-1111-2222-3333-444455556666",
  price: 850000000,
  priceUnit: "total",
  transactionType: "sale" as const,
  propertyTypeLabel: "Rumah",
  cityName: "Kabupaten Bogor",
  provinceName: "Jawa Barat",
  siteUrl: "https://rumahagen.com/",
};

describe("buildListingWhatsAppMessage", () => {
  it("memuat semua penanda listing", () => {
    const m = buildListingWhatsAppMessage(base);
    expect(m).toContain("Halo Kak Rian Saputra,");
    expect(m).toContain("*Rumah Minimalis Modern 2 Lantai*");
    expect(m).toContain("Harga: Rp 850.000.000");
    expect(m).toContain("Lokasi: Kabupaten Bogor, Jawa Barat");
    expect(m).toContain("Tipe: Rumah (Dijual)");
    expect(m).toContain("Kode listing: RA-1A2B3C4D");
    expect(m).toContain("Tautan: https://rumahagen.com/listing/rumah-minimalis-a1b2c3");
  });
  it("sewa memuat satuan harga; tanpa nama agen dan lokasi", () => {
    const m = buildListingWhatsAppMessage({ ...base, agentName: null, cityName: null, provinceName: null, transactionType: "rent", price: 5000000, priceUnit: "per_bulan" });
    expect(m.startsWith("Halo,\n")).toBe(true);
    expect(m).toContain("Harga: Rp 5.000.000 / bulan");
    expect(m).toContain("(Disewa)");
    expect(m).not.toContain("Lokasi:");
  });
  it("karakter format WhatsApp dihapus dari judul dan nama", () => {
    const m = buildListingWhatsAppMessage({ ...base, title: "Rumah *Murah* _Banget_", agentName: "A*B" });
    expect(m).toContain("*Rumah Murah Banget*");
    expect(m).toContain("Halo Kak AB,");
  });
  it("kode listing", () => {
    expect(listingCode("1a2b3c4d-1111-2222-3333-444455556666")).toBe("RA-1A2B3C4D");
  });
});
