import { describe, expect, it } from "vitest";
import { approvalPdfHref, canCreateListing, canOpenApprovalPdf, canWithdraw, claimStatus, kitTypeLabel, projectKindLabel, safeKitUrl, validateWhatsapp } from "./claim-rules";

describe("status klaim", () => {
  it("semua nilai CHECK punya label; tak dikenal apa adanya", () => {
    for (const s of ["pending", "approved", "rejected", "revoked", "withdrawn"]) expect(claimStatus(s).label).not.toBe(s);
    expect(claimStatus("approved").tone).toBe("success");
    expect(claimStatus("x")).toEqual({ label: "x", tone: "neutral" });
  });
  it("aksi menurut status", () => {
    expect(canWithdraw("pending")).toBe(true);
    for (const s of ["approved", "rejected", "revoked", "withdrawn"]) expect(canWithdraw(s)).toBe(false);
    expect(canOpenApprovalPdf("approved")).toBe(true);
    expect(canOpenApprovalPdf("pending")).toBe(false);
    expect(canCreateListing("approved", false)).toBe(true);
    expect(canCreateListing("approved", true)).toBe(false);
    expect(canCreateListing("pending", false)).toBe(false);
    expect(approvalPdfHref("abc")).toBe("/api/claims/abc/approval-pdf");
  });
});

describe("label dan tautan", () => {
  it("jenis proyek dan berkas kit", () => {
    expect(projectKindLabel("primary", "rumah")).toBe("Primary · Rumah");
    expect(projectKindLabel(null, "ruko")).toBe("Ruko");
    expect(projectKindLabel(null, null)).toBe("");
    expect(kitTypeLabel("brochure")).toBe("Brosur");
    expect(kitTypeLabel("price_list")).toBe("Daftar Harga");
    expect(kitTypeLabel("lain")).toBe("lain");
  });
  it("hanya tautan https untuk unduhan kit", () => {
    expect(safeKitUrl("https://x.supabase.co/a.pdf?token=1")).toBe("https://x.supabase.co/a.pdf?token=1");
    expect(safeKitUrl("http://x.com/a.pdf")).toBeNull();
    expect(safeKitUrl("javascript:alert(1)")).toBeNull();
    expect(safeKitUrl(null)).toBeNull();
  });
});

describe("nomor WhatsApp", () => {
  it("wajib dan berformat wajar", () => {
    expect(validateWhatsapp("")).toMatch(/wajib/);
    expect(validateWhatsapp("   ")).toMatch(/wajib/);
    expect(validateWhatsapp("0812-3456-7890")).toBeNull();
    expect(validateWhatsapp("+62 812 3456 7890")).toBeNull();
    expect(validateWhatsapp("abc")).toMatch(/6-20/);
    expect(validateWhatsapp("1".repeat(21))).toMatch(/6-20/);
  });
});
