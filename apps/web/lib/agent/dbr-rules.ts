// lib/agent/dbr-rules.ts — aturan tampilan dan validasi Kalkulator DBR Agent (M07: Kalkulator, Riwayat, Detail, halaman berbagi). Murni tanpa I/O (diuji). Perhitungan DBR TIDAK dilakukan di klien: server menghitung
// (lib/dbr/calculate.ts lewat POST /dbr-simulations, hasil historis tidak berubah); di sini hanya validasi isian, label, dan bilah pengukur. Status eligibility mengikuti CHECK dbr_simulations
// (layak | perlu_review | tidak_layak); ambang bank = threshold_used (snapshot saat simulasi).
import type { BadgeTone } from "@/components/ui/Badge";
import { parseNumber } from "./listing-wizard";

export const TENOR_OPTIONS = [120, 180, 240] as const;
export const tenorLabel = (months: number) => (months % 12 === 0 ? `${months / 12} tahun (${months} bulan)` : `${months} bulan`);

export const ELIGIBILITY: Record<string, { label: string; tone: BadgeTone; color: string }> = {
  layak: { label: "Layak", tone: "success", color: "text-success-600" },
  perlu_review: { label: "Perlu Review", tone: "warning", color: "text-warning-600" },
  tidak_layak: { label: "Tidak Layak", tone: "danger", color: "text-danger-600" },
};
export const eligibility = (s: string) => ELIGIBILITY[s] ?? { label: s, tone: "neutral" as BadgeTone, color: "text-ink-500" };

/** Lebar bilah pengukur 0-100 (skala wireframe: 50% DBR = penuh). Nilai tak valid = 0. */
export const gaugePercent = (dbr: number) => (Number.isFinite(dbr) ? Math.min(100, Math.max(0, dbr * 2)) : 0);

export const formatPercent = (n: number) => `${new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)}%`;

export type DbrForm = { bankId: string; netIncome: string; existing: string; price: string; downPayment: string; tenor: string; rate: string };
export const EMPTY_DBR_FORM: DbrForm = { bankId: "", netIncome: "", existing: "", price: "", downPayment: "", tenor: String(TENOR_OPTIONS[0]), rate: "" };
export type DbrErrors = Partial<Record<keyof DbrForm, string>>;

export type DbrPayload = {
  bank_id: string;
  net_income: number;
  existing_installments?: number;
  property_price: number;
  down_payment: number;
  tenor_months: number;
  interest_rate_annual?: number;
};

/** Isian → badan POST /dbr-simulations. Aturan sama dengan createDbrSimulationSchema, ditambah DP harus lebih kecil dari harga (plafon > 0) dan bunga wajar (<= 100). */
export function validateDbrForm(f: DbrForm): { errors: DbrErrors; payload: DbrPayload | null } {
  const errors: DbrErrors = {};
  const income = parseNumber(f.netIncome);
  const price = parseNumber(f.price);
  const dp = parseNumber(f.downPayment);
  const existing = f.existing.trim() ? parseNumber(f.existing) : 0;
  const rate = f.rate.trim() ? parseNumber(f.rate) : null;
  const tenor = Number(f.tenor);

  if (!f.bankId) errors.bankId = "Pilih bank terlebih dahulu.";
  if (income === null || income <= 0) errors.netIncome = "Isi penghasilan bersih per bulan (lebih dari 0).";
  if (existing === null || existing < 0) errors.existing = "Cicilan berjalan tidak valid.";
  if (price === null || price <= 0) errors.price = "Isi harga properti (lebih dari 0).";
  if (dp === null || dp < 0) errors.downPayment = "Isi uang muka (boleh 0).";
  else if (price !== null && price > 0 && dp >= price) errors.downPayment = "Uang muka harus lebih kecil dari harga properti.";
  if (!Number.isInteger(tenor) || tenor <= 0) errors.tenor = "Pilih tenor.";
  if (f.rate.trim() && (rate === null || rate <= 0 || rate > 100)) errors.rate = "Suku bunga harus lebih dari 0 dan paling tinggi 100.";

  if (Object.keys(errors).length > 0) return { errors, payload: null };
  return {
    errors,
    payload: {
      bank_id: f.bankId,
      net_income: income!,
      ...(existing! > 0 ? { existing_installments: existing! } : {}),
      property_price: price!,
      down_payment: dp!,
      tenor_months: tenor,
      ...(rate !== null ? { interest_rate_annual: rate } : {}),
    },
  };
}

export type ShareState = "belum" | "aktif" | "dicabut";
/** Status berbagi dari kolom simulasi: aktif = pernah dibagikan dan belum dicabut. */
export function shareState(s: { sharedAt: string | null; revokedAt: string | null }): ShareState {
  if (!s.sharedAt) return "belum";
  return s.revokedAt ? "dicabut" : "aktif";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

/** Tautan berbagi untuk prospek (halaman publik tanpa login). */
export const shareUrl = (origin: string, token: string) => `${origin.replace(/\/+$/, "")}/dbr/shared/${token}`;

export function prospectLabel(name: string | null, phone: string | null): string {
  const n = name?.trim();
  const p = phone?.trim();
  if (n && p) return `${n} · ${p}`;
  return n || p || "Belum disimpan sebagai prospek";
}
