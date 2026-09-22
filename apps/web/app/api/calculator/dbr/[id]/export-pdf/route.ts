// app/api/calculator/dbr/[id]/export-pdf/route.ts
// GET /calculator/dbr/{id}/export-pdf (STEP11-B10 M07 list, PRESERVE).
// Respons file PDF langsung (application/pdf), BUKAN amplop JSON
// {data, meta} -- sengaja TIDAK dibungkus withApiHandler, sama seperti
// app/api/admin/reports/export/route.ts. Otorisasi tetap lewat RLS
// dbr_simulations_select (has_permission('m07.dbr.domain_operations',
// agent_id)) lewat client bersesi normal -- kalau caller bukan pemilik/staf,
// query di bawah mengembalikan baris kosong (bukan admin client, tidak ada
// bypass RLS di endpoint ini).
//
// PDF dibuat on-the-fly, tidak dipersist ke Storage (lihat lib/dbr/pdf.ts
// untuk alasan cakupan).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDbrSimulationPdf } from "@/lib/dbr/pdf";

export async function GET(_request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const { id } = await routeContext.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dbr_simulations")
    .select("*, banks(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." } }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Simulasi DBR tidak ditemukan atau Anda tidak punya akses." } },
      { status: 404 },
    );
  }

  const bank = Array.isArray(data.banks) ? data.banks[0] : data.banks;

  const pdfBytes = await generateDbrSimulationPdf({
    id: data.id,
    bankName: bank?.name ?? "-",
    prospectName: data.prospect_name,
    prospectPhone: data.prospect_phone,
    propertyPrice: Number(data.property_price),
    downPayment: Number(data.down_payment),
    loanAmount: Number(data.loan_amount),
    tenorMonths: data.tenor_months,
    interestRateAnnual: Number(data.interest_rate_annual),
    netIncome: Number(data.net_income),
    existingInstallments: Number(data.existing_installments),
    monthlyInstallment: Number(data.monthly_installment),
    dbrPercent: Number(data.dbr_percent),
    eligibilityStatus: data.eligibility_status,
    createdAt: data.created_at,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dbr-simulasi-${data.id}.pdf"`,
    },
  });
}
