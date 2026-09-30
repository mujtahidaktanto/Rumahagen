// lib/partner/project-rules.ts — aturan murni Proyek Saya (M06, wireframe 03-Developer-Partner/M06-{Kelola-Proyek,Form-Proyek,Detail-Proyek}). Label status/kategori/transaksi
// DIPAKAI ULANG dari lib/admin/developer-admin-rules.ts (sama persis, murni tanpa I/O). Developer Partner TIDAK bisa memilih status "active" — publish/aktivasi hanya tim
// RumahAgen (trigger enforce_developer_project_publish_permission, migration 0034; SOURCE-Developer-Partner.md §7).
export { PROJECT_STATUS, projectStatus, CATEGORY_LABEL, TRANSACTION_LABEL } from "@/lib/admin/developer-admin-rules";

export const PARTNER_PROJECT_STATUS_OPTIONS = ["coming_soon", "sold_out", "inactive"] as const;

export type ProjectForm = {
  name: string;
  category: "primary" | "secondary";
  transactionType: "sale" | "rent";
  propertyType: string;
  location: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  areaKeyword: string;
  priceMin: string;
  priceMax: string;
  priceUnit: "total" | "per_bulan" | "per_tahun";
  isNegotiable: boolean;
  unitAvailability: string;
  bedrooms: string;
  bathrooms: string;
  landArea: string;
  buildingArea: string;
  floors: string;
  carportCapacity: string;
  electricalPower: string;
  waterSource: string;
  furnishing: string;
  yearBuilt: string;
  certificateType: string;
  certificateTransferred: boolean;
  imbStatus: string;
  disputeFreeDeclared: boolean;
  commissionScheme: string;
  extraCommission: string;
};

export type ProjectFormErrors = Partial<Record<"name" | "provinceId" | "cityId" | "districtId", string>>;

export function validateProjectForm(f: ProjectForm): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  if (!f.name.trim()) errors.name = "Nama proyek wajib diisi.";
  else if (f.name.trim().length > 200) errors.name = "Maksimal 200 karakter.";
  if (!f.provinceId) errors.provinceId = "Pilih provinsi.";
  if (!f.cityId) errors.cityId = "Pilih kota/kabupaten.";
  if (!f.districtId) errors.districtId = "Pilih kecamatan.";
  return errors;
}
