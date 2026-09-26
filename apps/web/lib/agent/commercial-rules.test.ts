import { describe, expect, it } from "vitest";
import { addonCapacities, addonValidityLabel, canPayOrCancel, capacityLabel, displayedPrice, entitlementCapacityLabel, entitlementExpiry, entitlementLabel, entitlementStatus, hasSlot, orderProductName, orderStatus, parseOrderLimit, promotionIdToSend, safePaymentUrl, subscriptionStatus } from "./commercial-rules";

const combo = { capacity_type: "listing_refresh", capacity_value: "50", additional_capacities: [{ capacity_type: "listing_slot", capacity_value: 25 }], validity_type: "days", validity_days: 30 };

describe("kapasitas add-on", () => {
  it("utama lalu tambahan; nilai tak valid dibuang", () => {
    expect(addonCapacities(combo)).toEqual([{ type: "listing_refresh", value: 50 }, { type: "listing_slot", value: 25 }]);
    expect(addonCapacities({ ...combo, capacity_type: null, capacity_value: null, additional_capacities: null })).toEqual([]);
    expect(addonCapacities({ ...combo, capacity_value: 0, additional_capacities: [] })).toEqual([]);
  });
  it("label kapasitas dan deteksi slot", () => {
    expect(capacityLabel({ type: "listing_refresh", value: 50 })).toBe("50 kali Refresh Listing");
    expect(capacityLabel({ type: "listing_slot", value: 1000 })).toBe("1.000 slot listing");
    expect(capacityLabel({ type: "learning_point", value: 200 })).toBe("200 Learning Points");
    expect(capacityLabel({ type: "baru", value: 3 })).toBe("3 baru");
    expect(hasSlot(combo)).toBe(true);
    expect(hasSlot({ ...combo, additional_capacities: [] })).toBe(false);
  });
  it("masa berlaku: slot dan saldo refresh tidak kedaluwarsa; poin mengikuti hari", () => {
    expect(addonValidityLabel(combo)).toMatch(/Tidak kedaluwarsa/);
    expect(addonValidityLabel({ capacity_type: "learning_point", capacity_value: 100, validity_type: "days", validity_days: 30 })).toBe("Masa berlaku 30 hari");
    expect(addonValidityLabel({ capacity_type: "learning_point", capacity_value: 100, validity_type: "unlimited", validity_days: null })).toBe("Tanpa batas waktu");
  });
});

describe("harga tampilan dan promosi", () => {
  const offer = { promotion_id: "p1", eligible: true, reason: null, list_price: 150000, final_amount: 120000 };
  it("promosi berlaku = harga akhir dan promotion_id dikirim", () => {
    expect(displayedPrice(150000, offer)).toEqual({ amount: 120000, listPrice: 150000, discounted: true, note: null });
    expect(promotionIdToSend(offer)).toBe("p1");
  });
  it("tidak berlaku = harga normal dengan alasan, promotion_id tidak dikirim", () => {
    const no = { ...offer, eligible: false, reason: "Hanya untuk pembelian pertama", final_amount: 150000 };
    expect(displayedPrice(150000, no)).toEqual({ amount: 150000, listPrice: 150000, discounted: false, note: "Hanya untuk pembelian pertama" });
    expect(promotionIdToSend(no)).toBeUndefined();
    expect(displayedPrice(150000, null).discounted).toBe(false);
  });
});

describe("status", () => {
  it("pesanan: nilai dikenal, tak dikenal tampil apa adanya", () => {
    expect(orderStatus("pending")).toEqual({ label: "Menunggu Pembayaran", tone: "warning" });
    expect(orderStatus("confirmed").tone).toBe("success");
    expect(orderStatus("aneh")).toEqual({ label: "aneh", tone: "neutral" });
    expect(canPayOrCancel("pending")).toBe(true);
    expect(canPayOrCancel("confirmed")).toBe(false);
  });
  it("entitlement mengikuti CHECK lifecycle_status", () => {
    for (const s of ["pending", "active", "expired", "revoked", "consumed", "reversed"]) expect(entitlementStatus(s).label).not.toBe(s);
    expect(entitlementStatus("x").label).toBe("x");
  });
  it("langganan tak dikenal diberi peringatan", () => {
    expect(subscriptionStatus("active").tone).toBe("success");
    expect(subscriptionStatus("zzz").label).toBe("Status tidak dikenal");
  });
});

describe("entitlement", () => {
  it("label dari entitlement_type", () => {
    expect(entitlementLabel("PAKET50:listing_refresh")).toBe("Refresh Listing");
    expect(entitlementLabel("SLOT_10:listing_slot")).toBe("Slot Listing Tambahan");
    expect(entitlementLabel("refresh_bonus")).toBe("Bonus Refresh Harian");
    expect(entitlementLabel("lain")).toBe("lain");
  });
  it("masa berlaku", () => {
    const f = (i: string) => `<${i}>`;
    expect(entitlementExpiry({ ends_at: null, lifecycle_status: "active" }, f)).toBe("Tidak kedaluwarsa");
    expect(entitlementExpiry({ ends_at: "2026-10-20T00:00:00Z", lifecycle_status: "active" }, f)).toBe("Berlaku s/d <2026-10-20T00:00:00Z>");
    expect(entitlementExpiry({ ends_at: "2026-09-15T00:00:00Z", lifecycle_status: "expired" }, f)).toBe("Berakhir <2026-09-15T00:00:00Z>");
    expect(entitlementExpiry({ ends_at: "2026-09-15T00:00:00Z", lifecycle_status: "revoked" }, f)).toBe("Berakhir <2026-09-15T00:00:00Z>");
  });
});

describe("snapshot pesanan", () => {
  it("nama dari addon atau paket", () => {
    expect(orderProductName({ addon: { name: "Paket 50 Refresh" } })).toBe("Paket 50 Refresh");
    expect(orderProductName({ plan: { name: "Pro Bulanan" } })).toBe("Pro Bulanan");
    expect(orderProductName({})).toBe("Pesanan");
    expect(orderProductName(null)).toBe("Pesanan");
  });
});

describe("alamat pembayaran", () => {
  it("hanya https milik midtrans", () => {
    expect(safePaymentUrl("https://app.sandbox.midtrans.com/snap/v4/redirection/abc")).toBe("https://app.sandbox.midtrans.com/snap/v4/redirection/abc");
    expect(safePaymentUrl("https://midtrans.com/x")).toBe("https://midtrans.com/x");
    expect(safePaymentUrl("http://app.midtrans.com/x")).toBeNull();
    expect(safePaymentUrl("https://evilmidtrans.com/x")).toBeNull();
    expect(safePaymentUrl("https://midtrans.com.evil.io/x")).toBeNull();
    expect(safePaymentUrl("javascript:alert(1)")).toBeNull();
    expect(safePaymentUrl(undefined)).toBeNull();
  });
});

describe("label kapasitas entitlement dan batas daftar", () => {
  it("jenis dari akhiran tipe", () => {
    expect(entitlementCapacityLabel("PAKET50:listing_refresh", 50)).toBe("50 kali Refresh Listing");
    expect(entitlementCapacityLabel("SLOT_10:listing_slot", 10)).toBe("10 slot listing");
    expect(entitlementCapacityLabel("refresh_bonus", 10)).toBe("10 kali per hari");
  });
  it("?tampil= dibatasi", () => {
    expect(parseOrderLimit(undefined)).toBe(10);
    expect(parseOrderLimit("20")).toBe(20);
    expect(parseOrderLimit("5")).toBe(10);
    expect(parseOrderLimit("9999")).toBe(10);
    expect(parseOrderLimit("abc")).toBe(10);
  });
});
