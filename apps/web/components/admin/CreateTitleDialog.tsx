"use client";

// components/admin/CreateTitleDialog.tsx — "+ Title Baru" (Jalur Penghargaan tab Title Definitions): POST /titles { code, name, description?, status? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function CreateTitleDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCode("");
    setName("");
    setDescription("");
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/titles", { code: code.trim(), name: name.trim(), description: description.trim() || undefined }, { idempotency: true });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Title belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
        + Title Baru
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Title Baru"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={code.trim().length === 0 || name.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Kode" required>
            {(a) => <Input {...a} value={code} onChange={(e) => setCode(e.target.value)} placeholder="mis. TOP-PERFORMER-Q" />}
          </Field>
          <Field label="Nama" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Deskripsi" hint="Opsional.">
            {(a) => <Textarea {...a} value={description} onChange={(e) => setDescription(e.target.value)} />}
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
