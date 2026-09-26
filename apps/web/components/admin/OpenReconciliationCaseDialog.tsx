"use client";

// components/admin/OpenReconciliationCaseDialog.tsx — "+ Buka Kasus Rekonsiliasi": POST /admin/commercial/entitlements/reconcile { entitlement_id, payment_transaction_id?, mismatch_category,
// evidence? }. case_number dibuat otomatis server (format REC-{timestamp}-{hex}), bukan format "RC-2026-xxxx" di wireframe (itu hanya contoh mock).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function OpenReconciliationCaseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entitlementId, setEntitlementId] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [category, setCategory] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEntitlementId("");
    setPaymentTransactionId("");
    setCategory("");
    setEvidenceNote("");
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post(
        "/admin/commercial/entitlements/reconcile",
        {
          entitlement_id: entitlementId.trim(),
          payment_transaction_id: paymentTransactionId.trim() || undefined,
          mismatch_category: category.trim(),
          evidence: evidenceNote.trim() ? { note: evidenceNote.trim() } : undefined,
        },
        { idempotency: true },
      );
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Kasus belum berhasil dibuka. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const canSave = /^[0-9a-f-]{36}$/i.test(entitlementId.trim()) && category.trim().length > 0;

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        + Buka Kasus Rekonsiliasi
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Buka Kasus Rekonsiliasi"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
              Buka Kasus
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Entitlement ID (uuid)" required>
            {(a) => <Input {...a} value={entitlementId} onChange={(e) => setEntitlementId(e.target.value)} />}
          </Field>
          <Field label="Payment Transaction ID" hint="Opsional.">
            {(a) => <Input {...a} value={paymentTransactionId} onChange={(e) => setPaymentTransactionId(e.target.value)} />}
          </Field>
          <Field label="Kategori Mismatch" required>
            {(a) => <Input {...a} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="mis. payment_confirmed_no_entitlement" />}
          </Field>
          <Field label="Bukti" hint="Catatan bebas, opsional.">
            {(a) => <Textarea {...a} value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} />}
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
