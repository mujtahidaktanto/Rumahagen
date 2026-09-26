"use client";

// components/admin/CreateBankDialog.tsx — "+ Tambah Bank" (Bank Master, Admin+Superadmin): POST /banks { name, dbr_threshold_percent, default_interest_rate, status }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function CreateBankDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dbrThreshold, setDbrThreshold] = useState("35");
  const [interestRate, setInterestRate] = useState("8.5");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setDbrThreshold("35");
    setInterestRate("8.5");
    setStatus("active");
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post(
        "/banks",
        { name: name.trim(), dbr_threshold_percent: Number(dbrThreshold), default_interest_rate: Number(interestRate), status },
        { idempotency: true },
      );
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Bank belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
      >
        + Tambah Bank
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Tambah Bank"
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
