// app/api/agents/me/statistics/export/route.ts
// GET /agents/me/statistics/export?format=xlsx|pdf&from=&to=&compare=[&organization_id=]
// Export mandiri "Statistik Saya" ke Excel/PDF oleh agen sendiri.
//
// OTORISASI: permission m08.dashboard_projection.export (ADD-NEW, 0125;
// agent=own, superadmin=all), dicek lewat has_permission() dengan sesi asli
// dan owner = pemanggil, sehingga Permission Preset yang tidak memuatnya
// ikut menolak. Cakupan organisasi tetap dijaga DB (pemimpin aktif saja).
//
// AUDIT: setiap export DICATAT ke audit_logs (log_audit_event) SEBELUM file
// dikirim; bila gagal dicatat, export dibatalkan (500).
//
// BUKAN endpoint JSON biasa (respons file), jadi tidak dibungkus
// withApiHandler -- sama seperti /admin/analytics/export.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiError, errorBody } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { agentStatsExportQuerySchema, compareOf } from "@/lib/validation/analytics";
import { loadAgentStats } from "@/lib/analytics/agent-stats";
import { buildAgentStatsPdf, buildAgentStatsWorkbook } from "@/lib/analytics/agent-export";

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

    const { data: allowed, error: permErr } = await supabase.rpc("has_permission", {
      p_action_code: "m08.dashboard_projection.export",
      p_owner_id: user.id,
    });
    if (permErr) throw permErr;
    if (!allowed) return jsonError("FORBIDDEN", "Anda tidak punya izin export statistik (m08.dashboard_projection.export).");

    await checkRateLimit(supabase, user.id);

    const parsed = agentStatsExportQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    if (!parsed.success) return jsonError("VALIDATION_ERROR", "Validasi query parameter gagal.", parsed.error.flatten());
    const { from, to, format, organization_id: organizationId } = parsed.data;
    const compare = compareOf(parsed.data);

    const stats = await loadAgentStats(supabase, { from, to, compare, organizationId });

    const { error: auditErr } = await supabase.rpc("log_audit_event", {
      p_action: "agent_statistics.export",
      p_entity_type: "agent_statistics_report",
      p_entity_id: user.id,
      p_organization_id: organizationId ?? null,
      p_new_value: { format, from, to, compare, scope: stats.scope, organization_id: organizationId ?? null, definition_version: stats.definition_version },
    });
    if (auditErr) throw auditErr;

    const exportedBy = user.email ?? user.id;
    const base = stats.scope === "own" ? "statistik-saya" : "statistik-organisasi";
    const filename = `rumahagen-${base}-${from}_${to}.${format}`;
    const body: BodyInit =
      format === "xlsx"
        ? new Uint8Array(buildAgentStatsWorkbook(stats, { exportedBy }))
        : new Uint8Array(await buildAgentStatsPdf(stats, { exportedBy }));

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
    console.error("Agent statistics export error:", err);
    return jsonError("INTERNAL_ERROR", "Terjadi kesalahan pada server.");
  }
}
