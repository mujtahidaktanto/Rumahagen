import { describe, expect, it } from "vitest";
import { QUOTA_KEYS, QUOTA_KEY_SET, validateQuotaForm, type QuotaForm } from "./system-config-rules";

const ok: QuotaForm = { freePersonal: "25", freeOrganization: "50", proPersonal: "75", proOrganization: "100", validityDays: "90", graceDays: "7", proProductCodes: "pro_bulanan,pro_tahunan" };

describe("validateQuotaForm", () => {
  it("isian valid tanpa galat", () => {
    expect(validateQuotaForm(ok)).toEqual({});
  });
  it("bilangan bulat 0-999999 untuk kuota dan grace; 1-999999 untuk validity", () => {
    expect(validateQuotaForm({ ...ok, freePersonal: "" }).freePersonal).toBeDefined();
    expect(validateQuotaForm({ ...ok, freePersonal: "-1" }).freePersonal).toBeDefined();
    expect(validateQuotaForm({ ...ok, freePersonal: "1.5" }).freePersonal).toBeDefined();
    expect(validateQuotaForm({ ...ok, freePersonal: "0" }).freePersonal).toBeUndefined();
    expect(validateQuotaForm({ ...ok, validityDays: "0" }).validityDays).toBeDefined();
    expect(validateQuotaForm({ ...ok, validityDays: "1" }).validityDays).toBeUndefined();
    expect(validateQuotaForm({ ...ok, graceDays: "0" }).graceDays).toBeUndefined();
    expect(validateQuotaForm({ ...ok, freeOrganization: "1000000" }).freeOrganization).toBeDefined(); // 7 digit, lebih dari batas 6 digit/999999
  });
  it("kode produk: huruf kecil/angka/garis bawah dipisah koma, tanpa spasi", () => {
    expect(validateQuotaForm({ ...ok, proProductCodes: "" }).proProductCodes).toBeDefined();
    expect(validateQuotaForm({ ...ok, proProductCodes: "Pro_Bulanan" }).proProductCodes).toBeDefined();
    expect(validateQuotaForm({ ...ok, proProductCodes: "pro bulanan" }).proProductCodes).toBeDefined();
    expect(validateQuotaForm({ ...ok, proProductCodes: "pro_bulanan, pro_tahunan" }).proProductCodes).toBeDefined();
    expect(validateQuotaForm({ ...ok, proProductCodes: "satu_kode" }).proProductCodes).toBeUndefined();
  });
});

describe("kunci system_configs", () => {
  it("7 kunci listing_quota.* persis", () => {
    expect(Object.values(QUOTA_KEYS).sort()).toEqual(
      ["listing_quota.free_organization", "listing_quota.free_personal", "listing_quota.grace_days", "listing_quota.pro_organization", "listing_quota.pro_personal", "listing_quota.pro_product_codes", "listing_quota.validity_days"].sort(),
    );
    expect(QUOTA_KEY_SET.has("listing_quota.free_personal")).toBe(true);
    expect(QUOTA_KEY_SET.has("refresh_allowance.default_daily")).toBe(false);
  });
});
