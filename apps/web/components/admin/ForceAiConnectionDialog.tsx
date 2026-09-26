"use client";

// components/admin/ForceAiConnectionDialog.tsx — "Force Action" per baris Koneksi Agent (Provider AI, Superadmin-only): POST /admin/ai-connections/{id}/force { action, reason? }, membungkus
// RPC admin_force_provider_connection(). Intervensi privileged — kasus penyalahgunaan/kredensial bocor, bukan pengelolaan rutin.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

type ForceAction = "force_revoke" | "force_disconnect" | "force_disable";

export function ForceAiConnectionDialog({ connectionId, agentName }: { connectionId: string; agentName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ForceAction>("force_revoke");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/ai-connections/${connectionId}/force`, { action, reason: reason.trim() || undefined }, { idempotency: true });
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dijalankan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setAction("force_revoke");
          setReason("");
          setError(null);
          setOpen(true);
        }}
      >
        Force Action
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Force Action — ${agentName}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void run()}>
              Jalankan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Tindakan">
            {(a) => (
              <Select {...a} value={action} onChange={(e) => setAction(e.target.value as ForceAction)}>
                <option value="force_revoke">force_revoke</option>
                <option value="force_disconnect">force_disconnect</option>
                <option value="force_disable">force_disable</option>
              </Select>
            )}
          </Field>
          <Field label="Alasan" hint="Opsional, tercatat di audit log.">
            {(a) => <Textarea {...a} value={reason} onChange={(e) => setReason(e.target.value)} />}
          </Field>
          <p className="text-caption">Intervensi privileged — hanya untuk kasus penyalahgunaan/kredensial bocor, bukan pengelolaan rutin (itu tetap milik agent sendiri).</p>
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
