import { describe, expect, it } from "vitest";
import { EMPTY_ORG, canInviteMembers, canLeaveOrg, canManageOrg, canRemoveMember, cleanOtp, closeStep, inviteExpiryText, isOtpShape, orgBanner, toBrandingPayload, toCreateOrgPayload, validateBranding, validateOrgForm, instagramOf } from "./org-rules";

const ok = { ...EMPTY_ORG, name: "PT Properti Jaya Sejahtera", type: "kantor", address: "Ruko Sunburst CBD, BSD City", phone: "(021) 5551234" };

describe("validateOrgForm", () => {
  it("minimal valid", () => expect(validateOrgForm(ok)).toEqual({}));
  it("nama, jenis, alamat, telepon wajib", () => {
    const e = validateOrgForm(EMPTY_ORG);
    expect(Object.keys(e).sort()).toEqual(["address", "name", "phone", "type"]);
  });
  it("batas panjang dan format", () => {
    expect(validateOrgForm({ ...ok, name: "x".repeat(151) }).name).toBeTruthy();
    expect(validateOrgForm({ ...ok, phone: "abc" }).phone).toBeTruthy();
    expect(validateOrgForm({ ...ok, phone: "0" .repeat(21) }).phone).toBeTruthy();
    expect(validateOrgForm({ ...ok, website: "http://x.com" }).website).toBeTruthy();
    expect(validateOrgForm({ ...ok, website: "https://x.com" }).website).toBeUndefined();
    expect(validateOrgForm({ ...ok, instagram: "nama akun" }).instagram).toBeTruthy();
    expect(validateOrgForm({ ...ok, instagram: "@properti.jaya" }).instagram).toBeUndefined();
  });
});

describe("toCreateOrgPayload", () => {
  it("bidang opsional kosong tidak dikirim; instagram diberi @", () => {
    const p = toCreateOrgPayload(ok);
    expect(p).toEqual({ organization_name: "PT Properti Jaya Sejahtera", organization_type: "kantor", address: "Ruko Sunburst CBD, BSD City", contact_phone: "(021) 5551234" });
    expect(toCreateOrgPayload({ ...ok, instagram: "propertijaya", website: "https://pj.id", description: " Tentang " })).toMatchObject({ social_media: { instagram: "@propertijaya" }, website: "https://pj.id", description: "Tentang" });
  });
});

describe("branding", () => {
  it("validasi dan badan; kosong = null; sosial media lain dipertahankan", () => {
    expect(validateBranding({ description: "", website: "ftp://x", instagram: "" }).website).toBeTruthy();
    expect(toBrandingPayload({ description: " ", website: "", instagram: "" }, null)).toEqual({ description: null, website: null, social_media: null });
    expect(toBrandingPayload({ description: "d", website: "https://a.id", instagram: "ig" }, { facebook: "fb.com/x", instagram: "@lama" })).toEqual({ description: "d", website: "https://a.id", social_media: { facebook: "fb.com/x", instagram: "@ig" } });
    expect(instagramOf({ instagram: "@a" })).toBe("@a");
    expect(instagramOf(null)).toBe("");
  });
});

describe("status dan izin", () => {
  it("spanduk menurut status", () => {
    expect(orgBanner("active", true)).toBeNull();
    expect(orgBanner("closing", true)?.text).toMatch(/Konfirmasi/);
    expect(orgBanner("closing", false)?.text).toMatch(/leader/i);
    expect(orgBanner("closed", true)?.tone).toBe("neutral");
    expect(orgBanner("suspended", true)?.tone).toBe("danger");
  });
  it("hanya leader pada organisasi aktif yang mengelola/mengundang", () => {
    expect(canManageOrg("leader", "active")).toBe(true);
    expect(canManageOrg("leader", "closing")).toBe(false);
    expect(canManageOrg("member", "active")).toBe(false);
    expect(canInviteMembers("leader", "suspended")).toBe(false);
  });
  it("mengeluarkan dan keluar", () => {
    expect(canRemoveMember("leader", "active", { role: "member", isSelf: false })).toBe(true);
    expect(canRemoveMember("leader", "active", { role: "leader", isSelf: true })).toBe(false);
    expect(canRemoveMember("member", "active", { role: "member", isSelf: false })).toBe(false);
    expect(canLeaveOrg("member", "active")).toBe(true);
    expect(canLeaveOrg("leader", "active")).toBe(false);
    expect(canLeaveOrg("member", "closed")).toBe(false);
  });
  it("langkah penutupan", () => {
    expect(closeStep("active", true)).toBe("close");
    expect(closeStep("closing", true)).toBe("confirm");
    expect(closeStep("closed", true)).toBeNull();
    expect(closeStep("active", false)).toBeNull();
  });
});

describe("OTP dan undangan", () => {
  it("OTP hanya angka maksimal 8", () => {
    expect(cleanOtp("12 34-56abc789012")).toBe("12345678");
    expect(isOtpShape("123456")).toBe(true);
    expect(isOtpShape("12345")).toBe(false);
  });
  it("teks masa berlaku undangan", () => {
    expect(inviteExpiryText("2026-09-30T00:00:00Z", false, () => "30 Sep 2026")).toBe("Berlaku sampai 30 Sep 2026");
    expect(inviteExpiryText("2026-09-01T00:00:00Z", true, () => "x")).toBe("Kedaluwarsa");
    expect(inviteExpiryText(null, false, () => "x")).toBe("");
  });
});
