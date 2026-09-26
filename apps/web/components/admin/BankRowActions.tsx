"use client";

// components/admin/BankRowActions.tsx — "Edit" per baris Bank Master (Admin+Superadmin): PUT /banks/{id} { name, dbr_threshold_percent, default_interest_rate, status }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { BankRow } from "@/lib/admin/bank-master-data";
import { ApiClientError, api } from "@/lib/api-client";

export function BankRowActions({ bank }: { bank: BankRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bank.name);
  const [dbrThreshold, setDbrThreshold] = useState(String(bank.dbrThresholdPercent));
  const [interestRate, setInterestRate] = useState(String(bank.defaultInterestRate));
  const [status, setStatus] = useState(bank.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(
        `/banks/${bank.id}`,
        { name: name.trim(), dbr_threshold_percent: Number(dbrThreshold), default_interest_rate: Number(interestRate), status },
        { idempotency: true },
      );
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
          setName(bank.name);
          setDbrThreshold(String(bank.dbrThresholdPercent));
          setInterestRate(String(bank.defaultInterestRate));
          setStatus(bank.status);
          setError(null);
          setOpen(true);
        }}
      >
        Edit
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Edit — ${bank.name}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={name.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Nama Bank" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ambang DBR (%)">{(a) => <Input {...a} type="number" min={0} max={100} value={dbrThreshold} onChange={(e) => setDbrThreshold(e.target.value)} />}</Field>
            <Field label="Bunga Default (%)">{(a) => <Input {...a} type="number" min={0} max={100} step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />}</Field>
          </div>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
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
