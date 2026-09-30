import { describe, expect, it } from "vitest";
import { validateProjectForm, type ProjectForm } from "./project-rules";

const EMPTY: ProjectForm = {
  name: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  category: "primary",
  transactionType: "sale",
  propertyType: "",
  location: "",
  provinceId: "",
  cityId: "",
  districtId: "",
  areaKeyword: "",
  priceMin: "",
  priceMax: "",
  priceUnit: "total",
  isNegotiable: false,
  unitAvailability: "",
  bedrooms: "",
  bathrooms: "",
  landArea: "",
  buildingArea: "",
  floors: "",
  carportCapacity: "",
  electricalPower: "",
  waterSource: "",
  furnishing: "",
  yearBuilt: "",
  certificateType: "",
  certificateTransferred: false,
  imbStatus: "",
  disputeFreeDeclared: false,
  commissionScheme: "",
  extraCommission: "",
};

describe("validateProjectForm", () => {
  it("nama dan wilayah wajib", () => {
    const errs = validateProjectForm(EMPTY);
    expect(errs.name).toBeDefined();
    expect(errs.provinceId).toBeDefined();
    expect(errs.cityId).toBeDefined();
    expect(errs.districtId).toBeDefined();
  });
  it("lolos bila lengkap", () => {
    expect(validateProjectForm({ ...EMPTY, name: "Cluster A", provinceId: "p1", cityId: "c1", districtId: "d1" })).toEqual({});
  });
  it("meta title lebih dari 70 karakter ditolak", () => {
    const errs = validateProjectForm({ ...EMPTY, name: "Cluster A", provinceId: "p1", cityId: "c1", districtId: "d1", metaTitle: "x".repeat(71) });
    expect(errs.metaTitle).toBeDefined();
  });
  it("meta description lebih dari 160 karakter ditolak", () => {
    const errs = validateProjectForm({ ...EMPTY, name: "Cluster A", provinceId: "p1", cityId: "c1", districtId: "d1", metaDescription: "x".repeat(161) });
    expect(errs.metaDescription).toBeDefined();
  });
});
