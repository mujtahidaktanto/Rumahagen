// lib/dbr/calculate.ts
// Realisasi "formula anuitas standar" yang dijanjikan komentar migration
// 0052 ("dihitung di lapisan aplikasi/REST API saat INSERT ... tidak ada
// bukti formula eksak di dokumen sumber manapun untuk dikunci sebagai
// trigger/fungsi SQL"). Basis evidence untuk pilihan konkret di sini:
//
// - "formula anuitas" (annuity) DISEBUT NAMANYA secara eksplisit di
//   komentar 0052 — ini formula matematis standar/baku, bukan kebijakan
//   bisnis yang dikarang: M = P * r * (1+r)^n / ((1+r)^n - 1).
// - Ambang eligibility_status memakai `dbr_config.dbr_threshold_percent`
//   (default 35.00, migration 0008 — sudah ADA di DB, bukan angka baru
//   yang dikarang di sini) + lebar pita "perlu_review" 10 percentage
//   points, SATU-SATUNYA angka pita yang dievidence di corpus dokumen
//   (PRE-00-I_M07_DOMAIN_ALIGNMENT_GATE §M07 "fixed 10-percentage-point
//   interpretation bands"). Arah pemetaan band ke status (dbr_percent
//   RENDAH = 'layak') adalah satu-satunya interpretasi yang koheren
//   secara definisi "debt burden ratio" (rasio lebih rendah = lebih
//   mampu bayar) — bukan kebijakan bisnis independen yang dikarang.
// - `loan_amount` dihitung sebagai property_price - down_payment (identitas
//   aritmetika standar pembiayaan, bukan aturan bisnis).
// - `interest_rate_annual` default ke `dbr_config.default_interest_rate`
//   (juga sudah ada di DB, default 8.50) kalau klien tidak mengisi.

export interface DbrCalculationInput {
  propertyPrice: number;
  downPayment: number;
  tenorMonths: number;
  interestRateAnnual: number;
  netIncome: number;
  existingInstallments: number;
  dbrThresholdPercent: number;
}

export interface DbrCalculationResult {
  loanAmount: number;
  monthlyInstallment: number;
  dbrPercent: number;
  eligibilityStatus: "layak" | "perlu_review" | "tidak_layak";
}

const REVIEW_BAND_WIDTH_PERCENT = 10;

export function calculateDbrSimulation(input: DbrCalculationInput): DbrCalculationResult {
  const loanAmount = input.propertyPrice - input.downPayment;
  const monthlyRate = input.interestRateAnnual / 12 / 100;
  const n = input.tenorMonths;

  const monthlyInstallment =
    monthlyRate === 0
      ? loanAmount / n
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

  const dbrPercent = ((monthlyInstallment + input.existingInstallments) / input.netIncome) * 100;

  let eligibilityStatus: DbrCalculationResult["eligibilityStatus"];
  if (dbrPercent <= input.dbrThresholdPercent) {
    eligibilityStatus = "layak";
  } else if (dbrPercent <= input.dbrThresholdPercent + REVIEW_BAND_WIDTH_PERCENT) {
    eligibilityStatus = "perlu_review";
  } else {
    eligibilityStatus = "tidak_layak";
  }

  return {
    loanAmount: Math.round(loanAmount * 100) / 100,
    monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
    dbrPercent: Math.round(dbrPercent * 100) / 100,
    eligibilityStatus,
  };
}
