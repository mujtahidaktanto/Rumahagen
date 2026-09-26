"use client";

// components/admin/ScopeRowActions.tsx — "Edit" per baris Cakupan Otoritas: PUT /title-authority-scopes/{id} { scope_type?, scope_reference?, status? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { ScopeStatus, TitleAuthorityScopeRow } from "@/lib/admin/awarding-path-data";
import { ApiClientError, api } from "@/lib/api-client";

export function ScopeRowActions({ scope }: { scope: TitleAuthorityScopeRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scopeType, setScopeType] = useState(scope.scopeType);
  const [scopeReference, setScopeReference] = useState(scope.scopeReference ?? "");
  const [status, setStatus] = useState(scope.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/title-authority-scopes/${scope.id}`, { scope_type: scopeType.trim(), scope_reference: scopeReference.trim() || undefined, status }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
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
          setScopeType(scope.scopeType);
          setScopeReference(scope.scopeReference ?? "");
          setStatus(scope.status);
          setError(null);
          setOpen(true);
        }}
      >
        Edit
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Edit Scope — ${scope.titleName}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={scopeType.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Tipe Scope" required>
            {(a) => <Input {...a} value={scopeType} onChange={(e) => setScopeType(e.target.value)} />}
          </Field>
          <Field label="Rujukan Scope" hint="Opsional.">
            {(a) => <Input {...a} value={scopeReference} onChange={(e) => setScopeReference(e.target.value)} />}
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
