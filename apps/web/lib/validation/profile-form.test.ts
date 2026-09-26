import { describe, expect, it } from "vitest";
import { addSpecialization, cleanNikInput, formatFileSize, isNikShape, ktpFileProblem, toProfilePayload, validateProfile, type ProfileFormValues } from "./profile-form";

const base: ProfileFormValues = {
  fullName: "Rian Saputra",
  whatsapp: "0812-3456-7890",
  bio: "",
  specialization: [],
  coverageArea: "",
  licenseNumber: "",
  officeName: "",
  provinceId: "",
  cityId: "",
  profileVisibility: "public",
  publicCtaEnabled: false,
  publicSlug: "rian-saputra-12345678",
};

describe("validateProfile", () => {
  it("profil minimal valid (nama + WhatsApp)", () => {
    expect(validateProfile(base)).toEqual({});
  });
  it("nama dan WhatsApp wajib", () => {
    const e = validateProfile({ ...base, fullName: "  ", whatsapp: "" });
    expect(e.fullName).toBeTruthy();
    expect(e.whatsapp).toBeTruthy();
  });
  it("WhatsApp harus nomor yang benar dan maks 20 karakter", () => {
    expect(validateProfile({ ...base, whatsapp: "abc" }).whatsapp).toBeTruthy();
    expect(validateProfile({ ...base, whatsapp: "081234567890123456789" }).whatsapp).toMatch(/20/);
    expect(validateProfile({ ...base, whatsapp: "+62 812 3456 7890" }).whatsapp).toBeUndefined();
  });
  it("kota tanpa provinsi ditolak; batas panjang", () => {
    expect(validateProfile({ ...base, cityId: "c1" }).cityId).toBeTruthy();
    expect(validateProfile({ ...base, licenseNumber: "x".repeat(51) }).licenseNumber).toBeTruthy();
    expect(validateProfile({ ...base, bio: "x".repeat(2001) }).bio).toBeTruthy();
  });
});

describe("toProfilePayload", () => {
  it("memangkas teks dan menghilangkan wilayah kosong", () => {
    const p = toProfilePayload({ ...base, fullName: "  Rian ", specialization: ["Rumah"], provinceId: "", cityId: "" });
    expect(p).toMatchObject({ full_name: "Rian", whatsapp_number: "0812-3456-7890", specialization: ["Rumah"], profile_visibility: "public", public_cta_enabled: false });
    expect(p).not.toHaveProperty("province_id");
    expect(p).not.toHaveProperty("city_id");
  });
  it("alamat profil hanya dikirim bila berubah", () => {
    expect(toProfilePayload(base)).not.toHaveProperty("public_slug");
    expect(toProfilePayload({ ...base, publicSlug: "rian-properti" }, { slugChanged: true })).toMatchObject({ public_slug: "rian-properti" });
    expect(toProfilePayload({ ...base, publicSlug: "" }, { slugChanged: true })).not.toHaveProperty("public_slug");
  });
  it("menyertakan provinsi dan kota bila dipilih", () => {
    expect(toProfilePayload({ ...base, provinceId: "p1", cityId: "c1" })).toMatchObject({ province_id: "p1", city_id: "c1" });
    expect(toProfilePayload({ ...base, provinceId: "p1", cityId: "" })).not.toHaveProperty("city_id");
  });
});

describe("addSpecialization", () => {
  it("menambah, memangkas, dan menolak duplikat/berlebih", () => {
    expect(addSpecialization([], "  Rumah   Tapak ").list).toEqual(["Rumah Tapak"]);
    expect(addSpecialization(["Rumah Tapak"], "rumah tapak").error).toMatch(/sudah ada/);
    expect(addSpecialization([], "x".repeat(41)).error).toBeTruthy();
    expect(addSpecialization(Array.from({ length: 8 }, (_, i) => `s${i}`), "baru").error).toMatch(/Maksimal 8/);
    expect(addSpecialization(["A"], "   ").list).toEqual(["A"]);
  });
});

describe("KTP", () => {
  it("NIK hanya 16 digit angka", () => {
    expect(cleanNikInput("3201-0112 3456 78901234")).toBe("3201011234567890");
    expect(isNikShape("3201011234567890")).toBe(true);
    expect(isNikShape("320101123456789")).toBe(false);
    expect(isNikShape("32010112345678aa")).toBe(false);
  });
  it("foto: format dan ukuran", () => {
    expect(ktpFileProblem({ type: "image/jpeg", size: 1_200_000 })).toBeNull();
    expect(ktpFileProblem({ type: "application/pdf", size: 1000 })).toMatch(/Format/);
    expect(ktpFileProblem({ type: "image/png", size: 6_000_000 })).toMatch(/5 MB/);
    expect(ktpFileProblem({ type: "image/webp", size: 0 })).toBeTruthy();
    expect(formatFileSize(1_258_291)).toBe("1,2 MB");
    expect(formatFileSize(34_000)).toBe("33 KB");
  });
});
