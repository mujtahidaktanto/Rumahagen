// app/api/admin/reports/export/route.ts
// GET /admin/reports/export (Gap #5, audit/CORE_DOCX_ZIP_VS_MIGRATED_
// BACKEND_AUDIT.md). Permission m09.administrative_export.export sudah
// di-seed Superadmin-only sejak 0009, tapi belum ada route yang memakainya
// -- ini menutupnya.
//
// SUMBER DATA: `audit_logs` -- PRE-00-K menulis "Domain-specific export
// remains domain-owned" (M09 TIDAK memiliki wewenang export data spesifik
// modul lain, mis. listings/courses) dan "M09 does not create generic
// cross-domain CRUD". Data administratif LINTAS-modul yang benar-benar
// dimiliki M09 sendiri hanyalah audit_logs (M09-R04 Administrative Audit
// Log) -- jadi "Global Administrative Export" dibaca sebagai versi
// download-penuh (CSV) dari data yang sama dengan GET /admin/audit-logs,
// BUKAN dump seluruh database (yang akan melanggar guardrail di atas).
// Tidak ada skema/tabel lain yang dievidensi Core untuk endpoint ini.
//
// OTORISASI LEBIH KETAT dari /admin/audit-logs: RLS audit_logs_select
// memakai m09.administrative_audit_log.view (Superadmin+Manager, M09-R04),
// TAPI M09-R11 mengunci export ini Superadmin-ONLY ("Global Administrative
// Export is Superadmin-only", PRE-00-K guardrail #9) -- Manager tidak boleh
// lolos di sini meski boleh di /admin/audit-logs. RLS tabel yang sama tidak
// bisa berbeda per-endpoint, jadi permission SUPERADMIN-ONLY dicek eksplisit
// di kode route dulu (via has_permission() RPC dengan sesi asli, BUKAN
// admin client -- has_permission() butuh auth.uid() dari sesi sungguhan)
// SEBELUM memakai admin client untuk query tanpa batasan RLS
// Manager-inclusive itu -- pola ini PERSIS yang didokumentasikan di
// lib/supabase/admin.ts sendiri.
//
// BUKAN endpoint JSON REST biasa (respons CSV file, bukan amplop
// {data, meta}) -- sengaja TIDAK dibungkus withApiHandler, sama seperti
// app/sitemap-*.xml/route.ts.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/api/csv";

// Batas praktis satu pemanggilan export -- bukan aturan bisnis Core (tidak
// dievidensi), murni pengaman supaya satu request tidak mencoba menarik
// jutaan baris sekaligus. Superadmin bisa memanggil ulang dengan filter
// created_at (lewat entity_type/action/dst.) untuk rentang lebih sempit.
const EXPORT_ROW_CAP = 5000;

const CSV_COLUMNS = ["id", "user_id", "action", "entity_type", "entity_id", "organization_id", "old_value", "new_value", "created_at"];

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: allowed, error: permErr } = await supabase.rpc("has_permission", {
    p_action_code: "m09.administrative_export.export",
  });

  if (permErr) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." } },
      { status: 500 },
    );
  }
  if (!allowed) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Export administratif hanya untuk Superadmin (M09-R11)." } },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const entityType = url.searchParams.get("entity_type");
  const action = url.searchParams.get("action");
  const userId = url.searchParams.get("user_id");
  const organizationId = url.searchParams.get("organization_id");

  const admin = createAdminClient();
  let query = admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, EXPORT_ROW_CAP - 1);

  if (entityType) query = query.eq("entity_type", entityType);
  if (action) query = query.eq("action", action);
  if (userId) query = query.eq("user_id", userId);
  if (organizationId) query = query.eq("organization_id", organizationId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." } },
      { status: 500 },
    );
  }

  const csv = toCsv(data ?? [], CSV_COLUMNS);
  const filename = `audit-logs-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
