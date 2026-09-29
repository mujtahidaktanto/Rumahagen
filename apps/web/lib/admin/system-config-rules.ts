// lib/admin/system-config-rules.ts — aturan murni Konfigurasi Sistem (M09, wireframe 02-Admin/M09-Konfigurasi-Sistem): validasi tab Kuota Listing (7 kunci `listing_quota.*`, migration 0140) dan
// format kode produk Pro. Angka juga ditegakkan di server (kolom system_configs.config_value bertipe TEXT tanpa CHECK numerik — validasi klien ini murni membantu UX, server tetap penentu akhir).
// Superadmin-only untuk mengubah (m09.system_configuration.manage); Admin/Manager tidak lolos meski tab ini terlihat di menu.
export type QuotaForm = {
  freePersonal: string;
  freeOrganization: string;
  proPersonal: string;
  proOrganization: string;
  validityDays: string;
  graceDays: string;
  proProductCodes: string;
};

export type QuotaErrors = Partial<Record<keyof QuotaForm, string>>;

const INT_RE = /^[0-9]{1,6}$/;
const intOk = (v: string, min: number) => INT_RE.test(v.trim()) && Number(v.trim()) >= min;
/** Kode produk: huruf kecil, angka, garis bawah; dipisah koma; tanpa spasi. */
const CODES_RE = /^[a-z0-9_]+(,[a-z0-9_]+)*$/;

export function validateQuotaForm(f: QuotaForm): QuotaErrors {
  const errors: QuotaErrors = {};
  if (!intOk(f.freePersonal, 0)) errors.freePersonal = "Isi bilangan bulat 0–999999.";
  if (!intOk(f.freeOrganization, 0)) errors.freeOrganization = "Isi bilangan bulat 0–999999.";
  if (!intOk(f.proPersonal, 0)) errors.proPersonal = "Isi bilangan bulat 0–999999.";
  if (!intOk(f.proOrganization, 0)) errors.proOrganization = "Isi bilangan bulat 0–999999.";
  if (!intOk(f.validityDays, 1)) errors.validityDays = "Isi bilangan bulat 1–999999.";
  if (!intOk(f.graceDays, 0)) errors.graceDays = "Isi bilangan bulat 0–999999.";
  const codes = f.proProductCodes.trim();
  if (!codes || !CODES_RE.test(codes)) errors.proProductCodes = "Format tidak valid, contoh: pro_bulanan,pro_tahunan";
  return errors;
}

/** Kunci system_configs persis (migration 0140) — urutan tetap dipakai form dan payload PUT per-key. */
export const QUOTA_KEYS = {
  freePersonal: "listing_quota.free_personal",
  freeOrganization: "listing_quota.free_organization",
  proPersonal: "listing_quota.pro_personal",
  proOrganization: "listing_quota.pro_organization",
  validityDays: "listing_quota.validity_days",
  graceDays: "listing_quota.grace_days",
  proProductCodes: "listing_quota.pro_product_codes",
} as const satisfies Record<keyof QuotaForm, string>;

/** Kunci ini dikelola khusus di tab Kuota Listing; disembunyikan dari daftar "key lain" di tab System Config supaya tidak tampil dobel. */
export const QUOTA_KEY_SET = new Set<string>(Object.values(QUOTA_KEYS));
