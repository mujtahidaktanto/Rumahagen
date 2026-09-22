// app/api/claims/[id]/approval-pdf/route.ts
// GET /claims/{id}/approval-pdf (STEP11-B3 §14 "Approval Claim PDF
// Generate/View/Download" + "Approval Record" — CONTROLLED GAP, tidak ada
// route/tabel dievidensi Core). Satu endpoint menutup View DAN Download
// sekaligus: default `Content-Disposition: inline` (tampil di browser =
// "View"), `?download=1` beralih ke `attachment` (unduh = "Download") —
// menghindari dua route nyaris identik untuk dua kata kerja yang actor-nya
// sama persis ("Agent/Developer evidence access").
//
// "Generate" (STEP11-B3: "Automatic/system consequence") diwujudkan
// sebagai render on-demand setiap request dari baris klaim yang SUDAH
// approved — bukan tabel Approval Record terpisah, karena baris
// agent_project_claims ITU SENDIRI sudah immutable-cukup begitu berstatus
// 'approved' (reviewed_by/reviewed_at otomatis terisi sejak 0035, tidak
// ada jalur balik ke 'pending'). Tidak ada permission baru — Core sendiri
// eksplisit "NO PERMISSION INVENTION, not a human RBAC permission" — RLS
// agent_project_claims_select yang SUDAH ADA (0035) persis mencakup
// "Agent/Developer evidence access": agent pemilik klaim, developer
// pemilik project, atau staf lewat m06.claim.review.
//
// Bukan endpoint JSON REST biasa (respons file PDF) -- sengaja TIDAK
// dibungkus withApiHandler, sama seperti export-pdf DBR (M07).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClaimApprovalPdf } from "@/lib/claims/pdf";

export async function GET(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const { id } = await routeContext.params;
  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  const supabase = await createClient();

  const { data: claim, error } = await supabase
    .from("agent_project_claims")
    .select(
      "*, developer_projects(name, location, property_type, transaction_type, price_min, price_max, commission_scheme, extra_commission, developer_partners(company_name, pic_name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." } }, { status: 500 });
  }
  if (!claim) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Klaim tidak ditemukan atau Anda tidak punya akses." } },
      { status: 404 },
    );
  }
  if (claim.status !== "approved") {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Klaim berstatus '${claim.status}' -- bukti persetujuan hanya tersedia untuk klaim 'approved'.` } },
      { status: 409 },
    );
  }

  const { data: agentProfile } = await supabase
    .from("agent_profiles")
    .select("full_name")
    .eq("user_id", claim.agent_id)
    .maybeSingle();

  const project = Array.isArray(claim.developer_projects) ? claim.developer_projects[0] : claim.developer_projects;
  const developer = Array.isArray(project?.developer_partners) ? project.developer_partners[0] : project?.developer_partners;

  const pdfBytes = await generateClaimApprovalPdf({
    claimId: claim.id,
    agentName: agentProfile?.full_name ?? "-",
    developerCompanyName: developer?.company_name ?? "-",
    developerPicName: developer?.pic_name ?? null,
    projectName: project?.name ?? "-",
    projectLocation: project?.location ?? null,
    propertyType: project?.property_type ?? "-",
    transactionType: project?.transaction_type ?? "-",
    priceMin: project?.price_min !== undefined && project?.price_min !== null ? Number(project.price_min) : null,
    priceMax: project?.price_max !== undefined && project?.price_max !== null ? Number(project.price_max) : null,
    commissionScheme: project?.commission_scheme ?? null,
    extraCommission: project?.extra_commission ?? null,
    claimedAt: claim.claimed_at,
    reviewedAt: claim.reviewed_at,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="klaim-approval-${claim.id}.pdf"`,
    },
  });
}
