"use client";

// components/admin/CreateScopeDialog.tsx — "+ Scope Baru" (Jalur Penghargaan tab Cakupan Otoritas): POST /titles/{titleId}/authority-scopes { scope_type, scope_reference?, status? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { ScopeStatus, TitleDefRow } from "@/lib/admin/awarding-path-data";
import { ApiClientError, api } from "@/lib/api-client";

export function CreateScopeDialog({ titles }: { titles: TitleDefRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titleId, setTitleId] = useState(titles[0]?.id ?? "");
  const [scopeType, setScopeType] = useState("");
  const [scopeReference, setScopeReference] = useState("");
  const [status, setStatus] = useState<ScopeStatus>("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitleId(titles[0]?.id ?? "");
    setScopeType("");
    setScopeReference("");
    setStatus("active");
    setError(null);
  }

  async function save() {
    if (!titleId) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/titles/${titleId}/authority-scopes`, { scope_type: scopeType.trim(), scope_reference: scopeReference.trim() || undefined, status }, { idempotency: true });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Scope belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        disabled={titles.length === 0}
      >
        + Scope Baru
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Scope Baru"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!titleId || scopeType.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Title terkait" required>
            {(a) => (
              <Select {...a} value={titleId} onChange={(e) => setTitleId(e.target.value)}>
                {titles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tipe Scope" required>
            {(a) => <Input {...a} value={scopeType} onChange={(e) => setScopeType(e.target.value)} placeholder="mis. region, organization" />}
          </Field>
          <Field label="Rujukan Scope" hint="Opsional.">
            {(a) => <Input {...a} value={scopeReference} onChange={(e) => setScopeReference(e.target.value)} placeholder="mis. Jabodetabek" />}
          </Field>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as ScopeStatus)}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            )}
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
