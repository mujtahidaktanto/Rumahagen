import { describe, expect, it } from "vitest";
import { redirectReasonLabel, validateInternalPath, validateRedirectForm } from "./url-redirect-rules";

describe("validateInternalPath", () => {
  it("jalur internal diawali / tanpa spasi", () => {
    expect(validateInternalPath("/listing/x")).toBeNull();
    expect(validateInternalPath("/")).toBeNull();
    expect(validateInternalPath("listing/x")).toBeDefined();
    expect(validateInternalPath("//evil.com")).toBeDefined();
    expect(validateInternalPath("/ada spasi")).toBeDefined();
    expect(validateInternalPath("https://x.com")).toBeDefined();
  });
});

describe("validateRedirectForm", () => {
  it("kedua jalur valid dan berbeda -> tanpa galat", () => {
    expect(validateRedirectForm("/lama", "/baru")).toEqual({});
  });
  it("jalur lama = jalur baru -> galat putaran", () => {
    expect(validateRedirectForm("/sama", "/sama").newPath).toBeDefined();
  });
  it("jalur tidak valid diteruskan", () => {
    expect(validateRedirectForm("bukan-jalur", "/baru").oldPath).toBeDefined();
  });
});

describe("redirectReasonLabel", () => {
  it("4 nilai CHECK; kosong/tak dikenal", () => {
    for (const r of ["slug_changed", "listing_deleted", "listing_merged", "lainnya"]) expect(redirectReasonLabel(r)).not.toBe(r);
    expect(redirectReasonLabel(null)).toBe("—");
    expect(redirectReasonLabel("aneh")).toBe("aneh");
  });
});
