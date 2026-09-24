// app/api/admin/analytics/export/route.ts
// GET /admin/analytics/export?format=xlsx|pdf&from=YYYY-MM-DD&to=YYYY-MM-DD&compare=true|false
// Export Dashboard Analytics ke Excel atau PDF (METRIC_DEFINITIONS v1.1).
//
// OTORISASI: permission m09.administrative_export.export (Superadmin-only,
// di-seed 0009), dicek lewat has_permission() dengan sesi asli -- pola sama
// dengan app/api/admin/reports/export/route.ts. Data dibaca lewat klien
// sesi yang sama (RPC 0124 memeriksa peran lagi di DB), TANPA service role.
//
// KENAPA ROUTE TERPISAH dari /admin/reports/export: route itu adalah export
// baris audit_logs (domain M09 sendiri). PRE-00-K menyatakan export
// spesifik-domain tetap dimiliki domainnya dan M09 tidak membuat CRUD/export
// lintas-domain generik. Export analitik ini hanya AGREGAT (jumlah/total),
// tanpa baris data pengguna, dan memakai gate permission export yang sama --
// tetapi tetap keputusan yang perlu dicatat: ini bukan dump data.
//
// AUDIT: setiap export DICATAT ke audit_logs (log_audit_event) SEBELUM file
// dikirim. Kalau pencatatan gagal, export dibatalkan (500) -- tidak ada
// export tanpa jejak.
//
// BUKAN endpoint JSON biasa (respons file), jadi tidak dibungkus
// withApiHandler -- sama seperti reports/export dan sitemap.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiError, errorBody } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { analyticsExportQuerySchema, compareOf } from "@/lib/validation/analytics";
import { loadDashboard } from "@/lib/analytics/dashboard";
import { buildAnalyticsWorkbook } from "@/lib/analytics/xlsx";
import { buildAnalyticsPdf } from "@/lib/analytics/pdf";

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function jsonError(code: ConstructorParameters<typeof ApiError>[0], message: string, details?: unknown): NextResponse {
  const err = new ApiError(code, message, details);
  return NextResponse.json(errorBody(err), { status: err.status });
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError("UNAUTHENTICATED", "Sesi tidak valid.");

    const { data: allowed, error: permErr } = await supabase.rpc("has_permission", { p_action_code: "m09.administrative_export.export" });
    if (permErr) throw permErr;
    if (!allowed) return jsonError("FORBIDDEN", "Export analitik hanya untuk Superadmin (m09.administrative_export.export).");

    await checkRateLimit(supabase, user.id);

    const parsed = analyticsExportQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    if (!parsed.success) return jsonError("VALIDATION_ERROR", "Validasi query parameter gagal.", parsed.error.flatten());
    const { from, to, format } = parsed.data;
    const compare = compareOf(parsed.data);

    const dashboard = await loadDashboard(supabase, { from, to, compare });

    const { error: auditErr } = await supabase.rpc("log_audit_event", {
      p_action: "analytics.export",
      p_entity_type: "analytics_report",
      p_new_value: { format, from, to, compare, definition_version: dashboard.definition_version },
    });
    if (auditErr) throw auditErr;

    const exportedBy = user.email ?? user.id;
    const filename = `rumahagen-analytics-${from}_${to}.${format}`;
    const body: BodyInit =
      format === "xlsx"
        ? new Uint8Array(buildAnalyticsWorkbook(dashboard, { exportedBy }))
        : new Uint8Array(await buildAnalyticsPdf(dashboard, { exportedBy }));

    return new NextResponse(body, {
      headers: {
        "Content-Type": format === "xlsx" ? XLSX_TYPE : "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(errorBody(err), { status: err.status });
    if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "42501") {
      return jsonError("FORBIDDEN", "Anda tidak punya akses untuk operasi ini.");
    }
    console.error("Analytics export error:", err);
    return jsonError("INTERNAL_ERROR", "Terjadi kesalahan pada server.");
  }
}
