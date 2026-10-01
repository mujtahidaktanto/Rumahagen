import { describe, expect, it } from "vitest";
import { validatePartnerProfileForm, type PartnerProfileForm } from "./profile-rules";

const EMPTY: PartnerProfileForm = { companyName: "", companyLogo: "", description: "", picName: "", picContact: "" };

describe("validatePartnerProfileForm", () => {
  it("nama perusahaan wajib", () => {
    expect(validatePartnerProfileForm(EMPTY).companyName).toBeDefined();
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya" }).companyName).toBeUndefined();
  });
  it("logo tidak lagi divalidasi di sini (diisi lewat unggah, bukan teks bebas)", () => {
    expect(validatePartnerProfileForm({ ...EMPTY, companyName: "PT Kanaya", companyLogo: "https://x.com/a.png" })).toEqual({});
  });
});
