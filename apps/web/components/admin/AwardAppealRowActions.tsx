"use client";

// components/admin/AwardAppealRowActions.tsx — "Putuskan"/"Pulihkan Award" di Banding Penghargaan (M15): POST /awards/{id}/appeals/{appealId}/decide { decision, decision_note? } dan
// POST /awards/{id}/restore (endpoint TERPISAH — menyetujui banding TIDAK otomatis memulihkan award, sesuai kontrak API-232/233).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function AwardAppealRowActions({ awardId, appealId, appellantName, canDecide, canRestore }: { awardId: string; appealId: string; appellantName: string; canDecide: boolean; canRestore: boolean }) {
  const router = useRouter();
  const [decideOpen, setDecideOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveDecision() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/awards/${awardId}/appeals/${appealId}/decide`, { decision, decision_note: note.trim() || undefined }, { idempotency: true });
      setDecideOpen(false);
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/awards/${awardId}/restore`, undefined, { idempotency: true });
      setRestoreOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dipulihkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canDecide ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setDecision("approved");
            setNote("");
            setError(null);
            setDecideOpen(true);
          }}
        >
          Putuskan
        </Button>
      ) : null}
      {canRestore ? (
        <Button
          size="sm"
          onClick={() => {
            setError(null);
            setRestoreOpen(true);
          }}
        >
          Pulihkan Award
        </Button>
      ) : null}

      <Dialog
        open={decideOpen}
        onClose={() => (busy ? undefined : setDecideOpen(false))}
        title={`Putuskan Banding — ${appellantName}`}
        description="Menyetujui TIDAK otomatis memulihkan award — langkah &quot;Pulihkan Award&quot; terpisah tetap harus dijalankan eksplisit setelah ini."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDecideOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void saveDecision()}>
              Simpan Keputusan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Keputusan">
            {(a) => (
              <Select {...a} value={decision} onChange={(e) => setDecision(e.target.value as "approved" | "rejected")}>
                <option value="approved">Setujui</option>
                <option value="rejected">Tolak</option>
              </Select>
            )}
          </Field>
          <Field label="Catatan keputusan" hint="Opsional.">
            {(a) => <Textarea {...a} value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={restoreOpen}
        onClose={() => (busy ? undefined : setRestoreOpen(false))}
        title={`Pulihkan Award — ${appellantName}?`}
        description="Endpoint TERPISAH (POST /awards/{id}/restore) dari keputusan banding — status award akan berubah dari 'revoked' menjadi 'restored'."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setRestoreOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void restore()}>
              Pulihkan
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
    </div>
  );
}
