"use client";

// components/admin/PendingListingRowActions.tsx — "Setujui"/"Tolak" di tab Antrean Review Pasca-Publish (Moderasi Listing): PUT /admin/listings/{id}/approve (butuh m03.listing.publish —
// Manager TIDAK PERNAH diberi grant ini walau tombolnya tetap tampil transparan, bukan disembunyikan, dengan catatan peringatan) dan PUT /admin/listings/{id}/reject { rejection_reason? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function PendingListingRowActions({ listingId, title, canApprove }: { listingId: string; title: string; canApprove: boolean }) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/listings/${listingId}/approve`, undefined, { idempotency: true });
      setApproveOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil menyetujui. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/listings/${listingId}/reject`, reason.trim() ? { rejection_reason: reason.trim() } : undefined, { idempotency: true });
      setRejectOpen(false);
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil menolak. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => {
            setError(null);
            setApproveOpen(true);
          }}
        >
          Setujui
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setError(null);
            setReason("");
            setRejectOpen(true);
          }}
        >
          Tolak
        </Button>
      </div>
      {!canApprove ? <span className="text-caption text-danger-600">Role Anda punya izin suspend tapi tidak publish — Setujui akan gagal 403.</span> : null}

      <Dialog
        open={approveOpen}
        onClose={() => (busy ? undefined : setApproveOpen(false))}
        title={`Setujui "${title}"?`}
        description="Listing kembali ke status 'published'. Butuh permission m03.listing.publish — Manager tidak pernah diberi grant ini walau bisa melihat antrean."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setApproveOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void approve()}>
              Setujui
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

      <Dialog
        open={rejectOpen}
        onClose={() => (busy ? undefined : setRejectOpen(false))}
        title={`Tolak "${title}"?`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void reject()}>
              Tolak
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Alasan penolakan" hint="Opsional.">
            {(a) => <Textarea {...a} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan penolakan…" />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
