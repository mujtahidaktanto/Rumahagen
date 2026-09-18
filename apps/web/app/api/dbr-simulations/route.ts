// app/api/dbr-simulations/route.ts
// POST/GET dbr_simulations (M07 Fase 1, migration 0052). RLS
// dbr_simulations_select/_insert (has_permission('m07.dbr.domain_operations',
// agent_id) — Agent=OWN, Superadmin/Admin/Manager=ALL) yang menggerbangi.
// Tidak ada literal endpoint STEP11 untuk M07 (tidak ada dokumen STEP11-B
// khusus M07 di corpus) — dibangun karena tabel+RLS+permission sudah ada
// sejak migration dan tidak ada jalur lain untuk memakainya.
//
// Lookup dbr_config SENGAJA memakai admin client, ditemukan lewat testing:
// RLS dbr_config_select (0008) memakai has_permission('m07.dbr.
// domain_operations', updated_by), dan `updated_by` baris config global ini
// TIDAK PERNAH sama dengan auth.uid() Agent mana pun (baris singleton,
// "pemilik"-nya konseptual tidak ada untuk scope 'own') — Agent biasa
// SELALU gagal membaca dbr_config lewat client sesi biasa, membuat endpoint
// ini gagal total untuk siapa pun kecuali staf. Nilai threshold/rate global
// bukan data sensitif per-pemilik; otorisasi SESUNGGUHNYA tetap ditegakkan
// RLS dbr_simulations_insert (agent_id harus sama dengan auth.uid()) saat
// INSERT di bawah, bukan oleh lookup config ini.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createDbrSimulationSchema } from "@/lib/validation/dbr-simulations";
import { calculateDbrSimulation } from "@/lib/dbr/calculate";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat simulasi DBR.");
  }

  const body = await validateJsonBody(ctx.request, createDbrSimulationSchema);
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: config, error: configError } = await admin
    .from("dbr_config")
    .select("dbr_threshold_percent, default_interest_rate")
    .limit(1)
    .maybeSingle();

  if (configError) {
    throw configError;
  }
  if (!config) {
    throw new ApiError("INTERNAL_ERROR", "dbr_config belum ada baris — hubungi Superadmin.");
  }

  const existingInstallments = body.existing_installments ?? 0;
  const interestRateAnnual = body.interest_rate_annual ?? Number(config.default_interest_rate);

  const result = calculateDbrSimulation({
    propertyPrice: body.property_price,
    downPayment: body.down_payment,
    tenorMonths: body.tenor_months,
    interestRateAnnual,
    netIncome: body.net_income,
    existingInstallments,
    dbrThresholdPercent: Number(config.dbr_threshold_percent),
  });

  const { data, error } = await supabase
    .from("dbr_simulations")
    .insert({
      agent_id: ctx.userId,
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
