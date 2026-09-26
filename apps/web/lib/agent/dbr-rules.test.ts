import { describe, expect, it } from "vitest";
import { EMPTY_DBR_FORM, eligibility, formatPercent, gaugePercent, isUuid, prospectLabel, shareState, shareUrl, tenorLabel, validateDbrForm } from "./dbr-rules";

const ok = { ...EMPTY_DBR_FORM, bankId: "b1", netIncome: "15.000.000", price: "500.000.000", downPayment: "100.000.000", tenor: "180" };

describe("validateDbrForm", () => {
  it("isian lengkap menjadi badan API; opsional dihilangkan", () => {
    const r = validateDbrForm(ok);
    expect(r.errors).toEqual({});
    expect(r.payload).toEqual({ bank_id: "b1", net_income: 15000000, property_price: 500000000, down_payment: 100000000, tenor_months: 180 });
  });
  it("cicilan berjalan dan bunga dikirim bila diisi (koma desimal)", () => {
    expect(validateDbrForm({ ...ok, existing: "2.000.000", rate: "8,5" }).payload).toMatchObject({ existing_installments: 2000000, interest_rate_annual: 8.5 });
  });
  it("wajib: bank, penghasilan, harga, DP; DP harus lebih kecil dari harga", () => {
    const r = validateDbrForm(EMPTY_DBR_FORM);
    expect(Object.keys(r.errors).sort()).toEqual(["bankId", "downPayment", "netIncome", "price"]);
    expect(r.payload).toBeNull();
    expect(validateDbrForm({ ...ok, downPayment: "500.000.000" }).errors.downPayment).toMatch(/lebih kecil/);
    expect(validateDbrForm({ ...ok, downPayment: "0" }).errors.downPayment).toBeUndefined();
  });
  it("angka tidak valid ditolak", () => {
    expect(validateDbrForm({ ...ok, netIncome: "abc" }).errors.netIncome).toBeDefined();
    expect(validateDbrForm({ ...ok, netIncome: "0" }).errors.netIncome).toBeDefined();
    expect(validateDbrForm({ ...ok, rate: "0" }).errors.rate).toBeDefined();
    expect(validateDbrForm({ ...ok, rate: "150" }).errors.rate).toBeDefined();
    expect(validateDbrForm({ ...ok, existing: "x" }).errors.existing).toBeDefined();
    expect(validateDbrForm({ ...ok, tenor: "" }).errors.tenor).toBeDefined();
  });
});

describe("tampilan", () => {
  it("label tenor, persen, bilah", () => {
    expect(tenorLabel(180)).toBe("15 tahun (180 bulan)");
    expect(tenorLabel(18)).toBe("18 bulan");
    expect(formatPercent(32.4)).toBe("32,4%");
    expect(formatPercent(35)).toBe("35%");
    expect(gaugePercent(32.4)).toBeCloseTo(64.8);
    expect(gaugePercent(80)).toBe(100);
    expect(gaugePercent(-3)).toBe(0);
    expect(gaugePercent(NaN)).toBe(0);
  });
  it("status kelayakan sesuai CHECK; tak dikenal apa adanya", () => {
    expect(eligibility("layak").tone).toBe("success");
    expect(eligibility("perlu_review").label).toBe("Perlu Review");
    expect(eligibility("tidak_layak").tone).toBe("danger");
    expect(eligibility("x")).toMatchObject({ label: "x", tone: "neutral" });
  });
  it("label prospek", () => {
    expect(prospectLabel("Budi", "0812")).toBe("Budi · 0812");
    expect(prospectLabel("Budi", null)).toBe("Budi");
    expect(prospectLabel(null, null)).toBe("Belum disimpan sebagai prospek");
  });
});

describe("berbagi", () => {
  it("status dari kolom", () => {
    expect(shareState({ sharedAt: null, revokedAt: null })).toBe("belum");
    expect(shareState({ sharedAt: "2026-09-26T00:00:00Z", revokedAt: null })).toBe("aktif");
    expect(shareState({ sharedAt: "2026-09-26T00:00:00Z", revokedAt: "2026-09-27T00:00:00Z" })).toBe("dicabut");
  });
  it("tautan dan validasi token", () => {
    expect(shareUrl("https://staging.rumahagen.com/", "abc")).toBe("https://staging.rumahagen.com/dbr/shared/abc");
    expect(isUuid("2e310408-7a1a-4c3b-9d2e-0a1b2c3d4e5f")).toBe(true);
    expect(isUuid("2e310408-7a1a")).toBe(false);
    expect(isUuid("../etc")).toBe(false);
  });
});
