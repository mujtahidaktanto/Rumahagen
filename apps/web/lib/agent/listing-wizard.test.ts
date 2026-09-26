import { describe, expect, it } from "vitest";
import { EMPTY_WIZARD, defaultPriceUnit, firstInvalidStep, formatPriceInput, isHttpsUrl, parseNumber, specLine, toCreatePayload, toUpdatePayload, validateStep, type WizardValues } from "./listing-wizard";

const full: WizardValues = {
  ...EMPTY_WIZARD,
  title: "Rumah Minimalis 2 Lantai BSD City",
  category: "secondary",
  transactionType: "sale",
  address: "Jl. Kenanga Raya No. 12",
  provinceId: "p",
  cityId: "c",
  districtId: "d",
  propertyType: "rumah",
  landArea: "150",
  buildingArea: "120,5",
  bedrooms: "3",
  bathrooms: "2",
  price: "850.000.000",
  whatsapp: "0812-3456-7890",
};

describe("parseNumber / formatPriceInput", () => {
  it("titik ribuan, koma desimal", () => {
    expect(parseNumber("850.000.000")).toBe(850000000);
    expect(parseNumber("120,5")).toBe(120.5);
    expect(parseNumber("1.200,5")).toBe(1200.5);
    expect(parseNumber("150")).toBe(150);
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("1.2")).toBeNull();
  });
  it("format harga ketikan", () => {
    expect(formatPriceInput("850000000")).toBe("850.000.000");
    expect(formatPriceInput("Rp 1.200")).toBe("1.200");
    expect(formatPriceInput("0012")).toBe("12");
    expect(formatPriceInput("")).toBe("");
  });
  it("satuan harga bawaan dan URL https", () => {
    expect(defaultPriceUnit("sale")).toBe("total");
    expect(defaultPriceUnit("rent")).toBe("per_bulan");
    expect(isHttpsUrl("https://x.id/a.jpg")).toBe(true);
    expect(isHttpsUrl("http://x.id/a.jpg")).toBe(false);
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("validateStep", () => {
  it("mulai, kategori, harga, kontak", () => {
    expect(validateStep("mulai", EMPTY_WIZARD).title).toBeTruthy();
    expect(validateStep("mulai", full)).toEqual({});
    expect(Object.keys(validateStep("kategori", EMPTY_WIZARD)).sort()).toEqual(["category", "transactionType"]);
    expect(validateStep("harga", { ...full, price: "0" }).price).toBeTruthy();
    expect(validateStep("kontak", { ...full, whatsapp: "abc" }).whatsapp).toBeTruthy();
    expect(validateStep("kontak", { ...full, metaTitle: "x".repeat(71) }).metaTitle).toBeTruthy();
  });
  it("lokasi wajib provinsi/kota/kecamatan; alamat dilewati saat terkunci", () => {
    expect(Object.keys(validateStep("lokasi", EMPTY_WIZARD)).sort()).toEqual(["address", "cityId", "districtId", "provinceId"]);
    expect(validateStep("lokasi", { ...full, address: "" }, { locked: true }).address).toBeUndefined();
  });
  it("detail: tipe wajib (kecuali terkunci), angka valid, tahun wajar", () => {
    expect(validateStep("detail", { ...full, propertyType: "" }).propertyType).toBeTruthy();
    expect(validateStep("detail", { ...full, propertyType: "" }, { locked: true }).propertyType).toBeUndefined();
    expect(validateStep("detail", { ...full, bedrooms: "dua" }).bedrooms).toBeTruthy();
    expect(validateStep("detail", { ...full, yearBuilt: "1800" }).yearBuilt).toBeTruthy();
  });
  it("media: batas foto dan tautan virtual tour", () => {
    expect(validateStep("media", { ...full, photoUrls: Array.from({ length: 21 }, (_, i) => `https://x.id/${i}.jpg`) }).photoUrls).toBeTruthy();
    expect(validateStep("media", { ...full, virtualTourUrl: "http://x" }).virtualTourUrl).toBeTruthy();
  });
  it("firstInvalidStep", () => {
    expect(firstInvalidStep(full)).toBeNull();
    expect(firstInvalidStep({ ...full, price: "" })).toBe("harga");
    expect(firstInvalidStep(EMPTY_WIZARD)).toBe("mulai");
  });
});

describe("payload", () => {
  it("create atas nama organisasi: konteks organization + organization_id; update tidak mengirim keduanya", () => {
    const org = { ...full, organizationId: "0f3c1a52-9c1d-4c47-8a55-2b0f6f0a9a11" };
    expect(toCreatePayload(org)).toMatchObject({ listing_context: "organization", organization_id: "0f3c1a52-9c1d-4c47-8a55-2b0f6f0a9a11" });
    const up = toUpdatePayload(org);
    expect(up).not.toHaveProperty("listing_context");
    expect(up).not.toHaveProperty("organization_id");
  });
  it("create: angka terurai dan bidang kosong dihilangkan", () => {
    const p = toCreatePayload(full);
    expect(p).toMatchObject({ category: "secondary", transaction_type: "sale", title: "Rumah Minimalis 2 Lantai BSD City", property_type: "rumah", price: 850000000, price_unit: "total", land_area: 150, building_area: 120.5, bedrooms: 3, bathrooms: 2, whatsapp_number: "0812-3456-7890", listing_context: "personal" });
    expect(p).not.toHaveProperty("organization_id");
    expect(p).not.toHaveProperty("floors");
    expect(p).not.toHaveProperty("certificate_type");
    expect(p).not.toHaveProperty("meta_title");
  });
  it("legalitas: sertifikat menyertakan status balik nama", () => {
    expect(toCreatePayload({ ...full, certificateType: "shm", certificateTransferred: true })).toMatchObject({ certificate_type: "shm", certificate_transferred: true });
  });
  it("update terkunci membuang alamat, tipe, dan luas", () => {
    const p = toUpdatePayload(full, { locked: true });
    for (const k of ["address", "property_type", "land_area", "building_area", "listing_context"]) expect(p).not.toHaveProperty(k);
    expect(p).toHaveProperty("title");
    expect(toUpdatePayload(full)).toHaveProperty("address");
  });
  it("ringkasan spesifikasi", () => {
    expect(specLine(full, (t) => t.toUpperCase())).toBe("RUMAH · 3 KT · 2 KM · LT 150 · LB 120,5");
  });
});

import { diffIds, diffMedia } from "./listing-wizard";

describe("diffMedia / diffIds", () => {
  it("media: hapus yang hilang, tambah yang baru dengan indeks", () => {
    const r = diffMedia([{ id: "1", url: "https://a" }, { id: "2", url: "https://b" }], ["https://b", "https://c"]);
    expect(r.remove).toEqual(["1"]);
    expect(r.add).toEqual([{ url: "https://c", index: 1 }]);
    expect(diffMedia([], ["https://x"]).add).toHaveLength(1);
    expect(diffMedia([{ id: "1", url: "https://a" }], ["https://a"])).toEqual({ remove: [], add: [] });
  });
  it("fasilitas: pasang dan lepas", () => {
    expect(diffIds(["a", "b"], ["b", "c"])).toEqual({ attach: ["c"], detach: ["a"] });
  });
});
