// app/api/dbr-simulations/route.ts
// POST/GET dbr_simulations (M07 Fase 1, migration 0052; diperluas 0089
// untuk model Bank Master — Gate PRE-00-I). RLS dbr_simulations_select/
// _insert (has_permission('m07.dbr.domain_operations', agent_id) —
// Agent=OWN, Superadmin/Admin/Manager=ALL) yang menggerbangi. Tidak ada
// literal endpoint STEP11 untuk M07 — dibangun karena tabel+RLS+permission
// sudah ada sejak migration dan tidak ada jalur lain untuk memakainya.
//
// DIPERBARUI 0089: threshold/rate TIDAK LAGI dibaca dari dbr_config global
// (model itu dinyatakan usang Gate PRE-00-I) — klien memilih `bank_id` dari
// Bank Master, endpoint membaca threshold/rate BANK ITU (RLS banks_select
// mengizinkan Agent lewat m07.bank_master.view, jadi client biasa cukup,
// tidak perlu admin client lagi seperti dbr_config dulu). threshold_used
// yang benar-benar tersimpan tetap snapshot dari trigger DB (enforce_dbr_
// simulation_bank_snapshot), bukan nilai yang dihitung di sini — dibaca di
// sini HANYA untuk kalkulasi dbr_percent sebelum INSERT.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createDbrSimulationSchema } from "@/lib/validation/dbr-simulations";
import { calculateDbrSimulation } from "@/lib/dbr/calculate";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat simulasi DBR.");
  }

  const body = await validateJsonBody(ctx.request, createDbrSimulationSchema);
  const supabase = await createClient();

  const { data: bank, error: bankError } = await supabase
    .from("banks")
    .select("dbr_threshold_percent, default_interest_rate, status")
    .eq("id", body.bank_id)
    .maybeSingle();

  if (bankError) {
    throw bankError;
  }
  if (!bank) {
    throw new ApiError("NOT_FOUND", "Bank tidak ditemukan.");
  }
  if (bank.status !== "active") {
    throw new ApiError("CONFLICT", "Bank ini tidak aktif, tidak bisa dipakai untuk simulasi baru.");
  }

  const existingInstallments = body.existing_installments ?? 0;
  const interestRateAnnual = body.interest_rate_annual ?? Number(bank.default_interest_rate);

  const result = calculateDbrSimulation({
    propertyPrice: body.property_price,
    downPayment: body.down_payment,
    tenorMonths: body.tenor_months,
    interestRateAnnual,
    netIncome: body.net_income,
    existingInstallments,
    dbrThresholdPercent: Number(bank.dbr_threshold_percent),
  });

  const { data, error } = await supabase
    .from("dbr_simulations")
    .insert({
      agent_id: ctx.userId,
      bank_id: body.bank_id,
      listing_id: body.listing_id ?? null,
      prospect_name: body.prospect_name ?? null,
      prospect_phone: body.prospect_phone ?? null,
      net_income: body.net_income,
      existing_installments: existingInstallments,
      property_price: body.property_price,
      down_payment: body.down_payment,
      loan_amount: result.loanAmount,
      tenor_months: body.tenor_months,
      interest_rate_annual: interestRateAnnual,
      monthly_installment: result.monthlyInstallment,
      dbr_percent: result.dbrPercent,
      eligibility_status: result.eligibilityStatus,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("dbr_simulations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
