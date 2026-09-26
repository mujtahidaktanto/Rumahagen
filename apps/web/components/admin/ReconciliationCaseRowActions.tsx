"use client";

// components/admin/ReconciliationCaseRowActions.tsx — "Review / Escalate" per baris (Komersial & Rekonsiliasi): POST /admin/commercial/reconciliation/{id}/resolve { status, resolution_metadata? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, Textarea } from "@/components/ui/Field";
import type { ReconciliationStatus } from "@/lib/admin/commercial-reconciliation-data";
import { ApiClientError, api } from "@/lib/api-client";

export function ReconciliationCaseRowActions({ caseId, caseNumber }: { caseId: string; caseNumber: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Exclude<ReconciliationStatus, "open">>("investigating");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/commercial/reconciliation/${caseId}/resolve`, { status, resolution_metadata: note.trim() ? { note: note.trim() } : undefined }, { idempotency: true });
      setOpen(false);
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setStatus("investigating");
          setNote("");
          setError(null);
          setOpen(true);
        }}
      >
        Review / Escalate
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Review — ${caseNumber}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Status baru">
            {(a) => (
              <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as Exclude<ReconciliationStatus, "open">)}>
                <option value="investigating">investigating</option>
                <option value="resolved">resolved</option>
                <option value="rejected">rejected</option>
                <option value="escalated">escalated</option>
              </Select>
            )}
          </Field>
          <Field label="Catatan resolusi" hint="Opsional.">
            {(a) => <Textarea {...a} value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
