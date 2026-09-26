"use client";

// components/admin/ExportAuditCsvButton.tsx — "Export CSV (Superadmin)" di Audit Log (M09 wireframe): dialog konfirmasi lalu unduh CSV dari data audit_logs mentah (bukan versi yang sudah
// diperkaya nama/email di tabel layar — kolom aktor/organisasi di CSV tetap UUID, sesuai field asli GET /admin/audit-logs API-149; tidak ada endpoint export khusus, jadi diambil lewat
// endpoint baca yang sudah ada, dipaginasi maksimal MAX_PAGE_SIZE=100/permintaan — dibatasi 5 halaman (500 baris) supaya tidak membebani browser; celah dicatat di audit/FRONTEND_GAPS.md).
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { api } from "@/lib/api-client";

type AuditLogRaw = { id: string; created_at: string; action: string; entity_type: string | null; entity_id: string | null; user_id: string | null; organization_id: string | null; old_value: unknown; new_value: unknown };

const EXPORT_PAGE_LIMIT = 100;
const EXPORT_MAX_PAGES = 5;

function toCsvCell(value: unknown): string {
  const s = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function ExportAuditCsvButton({ entityType, action, userId }: { entityType?: string; action?: string; userId?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const rows: AuditLogRaw[] = [];
      let truncated = false;
      for (let p = 0; p < EXPORT_MAX_PAGES; p++) {
        const res = await api.get<AuditLogRaw[]>("/admin/audit-logs", {
          entity_type: entityType || undefined,
          action: action || undefined,
          user_id: userId || undefined,
          limit: EXPORT_PAGE_LIMIT,
          offset: p * EXPORT_PAGE_LIMIT,
        });
        rows.push(...res.data);
        if (!res.meta?.pagination?.hasMore) break;
        if (p === EXPORT_MAX_PAGES - 1) truncated = true;
      }

      const header = ["created_at", "action", "entity_type", "entity_id", "user_id", "organization_id", "old_value", "new_value"];
      const lines = [header.join(",")];
      for (const r of rows) {
        lines.push([r.created_at, r.action, r.entity_type, r.entity_id, r.user_id, r.organization_id, r.old_value, r.new_value].map(toCsvCell).join(","));
      }
      if (truncated) lines.push(`# dibatasi ${EXPORT_MAX_PAGES * EXPORT_PAGE_LIMIT} baris pertama — persempit filter untuk cakupan lain`);

      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      setError("Belum berhasil mengekspor. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Export CSV (Superadmin)
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Export Audit Log (CSV)?"
        description="Administrative Export hanya untuk Superadmin — lebih ketat dari akses lihat Audit Log biasa (Admin bisa lihat, tapi tidak bisa export). Sumber data: audit_logs saja, bukan data lintas-modul lain."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void download()}>
              Unduh CSV
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}
