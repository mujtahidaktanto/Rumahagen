import { describe, expect, it } from "vitest";
import { validatePartnerProfileForm, type PartnerProfileForm } from "./profile-rules";

const EMPTY: PartnerProfileForm = { companyName: "", companyLogo: "", description: "", picName: "", picContact: "" };

describe("validatePartnerProfileForm", () => {
  it("nama perusahaan wajib", () => {
    expect(validatePartnerProfileForm(EMPTY).companyName).toBeDefined();
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya" }).companyName).toBeUndefined();
  });
  it("logo kosong ok, harus https bila diisi", () => {
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya" }).companyLogo).toBeUndefined();
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya", companyLogo: "http://x.com/a.png" }).companyLogo).toBeDefined();
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya", companyLogo: "bukan-url" }).companyLogo).toBeDefined();
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya", companyLogo: "https://x.com/a.png" }).companyLogo).toBeUndefined();
  });
});
