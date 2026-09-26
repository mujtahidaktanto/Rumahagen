"use client";

// components/admin/CreatePathDialog.tsx — "+ Awarding Path Baru" (Jalur Penghargaan tab Awarding Path & Versi): POST /titles/{titleId}/awarding-paths { code, name, status? }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { TitleDefRow } from "@/lib/admin/awarding-path-data";
import { ApiClientError, api } from "@/lib/api-client";

export function CreatePathDialog({ titles }: { titles: TitleDefRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titleId, setTitleId] = useState(titles[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitleId(titles[0]?.id ?? "");
    setCode("");
    setName("");
    setStatus("active");
    setError(null);
  }

  async function save() {
    if (!titleId) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/titles/${titleId}/awarding-paths`, { code: code.trim(), name: name.trim(), status: status.trim() || undefined }, { idempotency: true });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Awarding path belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
        + Awarding Path Baru
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Awarding Path Baru"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!titleId || code.trim().length === 0 || name.trim().length === 0} onClick={() => void save()}>
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
          <Field label="Kode Path" required>
            {(a) => <Input {...a} value={code} onChange={(e) => setCode(e.target.value)} />}
          </Field>
          <Field label="Nama Path" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Status" hint="Bebas teks (tidak dikunci enum), mis. active.">
            {(a) => <Input {...a} value={status} onChange={(e) => setStatus(e.target.value)} placeholder="active" />}
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
