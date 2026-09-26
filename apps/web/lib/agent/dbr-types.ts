// lib/agent/dbr-types.ts — bentuk simulasi DBR dan pemetaan baris database (snake_case) ke objek tampilan. Aman dipakai komponen klien (tanpa impor server); dipakai dbr-data.ts (server) dan
// komponen klien yang menerima baris hasil POST /dbr-simulations.
export type DbrSimulation = {
  id: string;
  bankId: string | null;
  bankName: string;
  prospectName: string | null;
  prospectPhone: string | null;
  netIncome: number;
  existingInstallments: number;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  tenorMonths: number;
  interestRateAnnual: number;
  monthlyInstallment: number;
  dbrPercent: number;
  eligibilityStatus: string;
  /** Ambang bank saat simulasi (snapshot). */
  thresholdUsed: number;
  createdAt: string;
  shareToken: string | null;
  sharedAt: string | null;
  revokedAt: string | null;
};

export type SimRow = {
  id: string;
  bank_id: string | null;
  prospect_name: string | null;
  prospect_phone: string | null;
  net_income: number | string;
  existing_installments: number | string | null;
  property_price: number | string;
  down_payment: number | string;
  loan_amount: number | string;
  tenor_months: number;
  interest_rate_annual: number | string;
  monthly_installment: number | string;
  dbr_percent: number | string;
  eligibility_status: string;
  threshold_used: number | string | null;
  created_at: string;
  share_token: string | null;
  shared_at: string | null;
  revoked_at: string | null;
  banks: { name: string } | { name: string }[] | null;
};


export function toSimulation(r: SimRow): DbrSimulation {
  const bank = Array.isArray(r.banks) ? r.banks[0] : r.banks;
  return {
    id: r.id,
    bankId: r.bank_id,
    bankName: bank?.name ?? "—",
    prospectName: r.prospect_name,
    prospectPhone: r.prospect_phone,
    netIncome: Number(r.net_income),
    existingInstallments: Number(r.existing_installments ?? 0),
    propertyPrice: Number(r.property_price),
    downPayment: Number(r.down_payment),
    loanAmount: Number(r.loan_amount),
    tenorMonths: r.tenor_months,
    interestRateAnnual: Number(r.interest_rate_annual),
    monthlyInstallment: Number(r.monthly_installment),
    dbrPercent: Number(r.dbr_percent),
    eligibilityStatus: r.eligibility_status,
    thresholdUsed: Number(r.threshold_used ?? 0),
    createdAt: r.created_at,
    shareToken: r.share_token,
    sharedAt: r.shared_at,
    revokedAt: r.revoked_at,
  };
}

