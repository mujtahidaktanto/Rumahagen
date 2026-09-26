"use client";

// components/agent/CancelRegistrationButton.tsx — tombol "Batalkan" pada Event Saya (M05): dialog konfirmasi lalu DELETE /api/events/{id}/rsvp (membatalkan pendaftaran milik sendiri, migration 0160).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";

export function CancelRegistrationButton({ eventId, title }: { eventId: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/events/${eventId}/rsvp`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Pembatalan belum berhasil. Periksa koneksi Anda lalu coba lagi.");
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
          setError(null);
          setOpen(true);
        }}
      >
        Batalkan
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Batalkan pendaftaran?"
        description={`Anda akan membatalkan pendaftaran untuk "${title}". Anda bisa mendaftar lagi selama pendaftaran masih dibuka.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Kembali
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void cancel()}>
              Ya, Batalkan
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
