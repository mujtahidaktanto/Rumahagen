"use client";

// components/admin/TitleRowActions.tsx — "Edit"/"Ubah Status" per baris Title Definitions: PUT /titles/{id} { name, description? } (code TIDAK bisa diubah, tidak ada field-nya di
// updateTitleSchema) dan PATCH /titles/{id}/status { status } (endpoint terpisah, draft/active/inactive/retired).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { TitleDefRow, TitleStatus } from "@/lib/admin/awarding-path-data";
import { ApiClientError, api } from "@/lib/api-client";

export function TitleRowActions({ title }: { title: TitleDefRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [name, setName] = useState(title.name);
  const [description, setDescription] = useState(title.description ?? "");
  const [status, setStatus] = useState<TitleStatus>(title.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveEdit() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/titles/${title.id}`, { name: name.trim(), description: description.trim() || undefined }, { idempotency: true });
      setEditOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveStatus() {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/titles/${title.id}/status`, { status }, { idempotency: true });
      setStatusOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Status belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setName(title.name);
          setDescription(title.description ?? "");
          setError(null);
          setEditOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setStatus(title.status);
          setError(null);
          setStatusOpen(true);
        }}
      >
        Ubah Status
      </Button>

      <Dialog
        open={editOpen}
        onClose={() => (busy ? undefined : setEditOpen(false))}
        title={`Edit — ${title.name}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={name.trim().length === 0} onClick={() => void saveEdit()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Kode" hint="Tidak bisa diubah setelah dibuat.">
            {(a) => <Input {...a} value={title.code} disabled readOnly />}
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

      <Dialog
        open={statusOpen}
        onClose={() => (busy ? undefined : setStatusOpen(false))}
        title={`Ubah Status — ${title.name}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setStatusOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void saveStatus()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Status">
            {(a) => (
              <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as TitleStatus)}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="retired">retired</option>
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
    </div>
  );
}
