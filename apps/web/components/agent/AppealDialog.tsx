"use client";

// components/agent/AppealDialog.tsx — "Ajukan Banding" untuk award yang dicabut (M15): POST /awards/{id}/appeals { reason }. Satu banding pending per award (unique index
// award_appeals_one_pending_per_award, 0098); kelayakan (award memang milik pemanggil, memang berstatus revoked) ditegakkan trigger DB, bukan diduplikasi di sini.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/Field";
import { validateAppealReason } from "@/lib/agent/qualification-rules";
import { ApiClientError, api } from "@/lib/api-client";

export function AppealDialog({ awardId, awardTitle }: { awardId: string; awardTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setTried(true);
    if (validateAppealReason(reason)) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/awards/${awardId}/appeals`, { reason: reason.trim() }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Banding belum berhasil dikirim. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="border-danger-600 text-danger-600"
        onClick={() => {
          setReason("");
          setTried(false);
          setError(null);
          setOpen(true);
        }}
      >
        Ajukan Banding
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Ajukan banding"
        description={`Jelaskan mengapa pencabutan award "${awardTitle}" perlu ditinjau ulang. Keputusan tim RumahAgen bersifat final dan hanya satu banding yang bisa menunggu pada satu waktu.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void submit()}>
              Kirim Banding
            </Button>
          </>
        }
      >
        <Field label="Alasan banding" required error={tried ? validateAppealReason(reason) : undefined}>
          {(a) => <Textarea {...a} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan alasan dan bukti pendukung" />}
        </Field>
        {error ? (
          <p role="alert" className="mt-2 text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}
