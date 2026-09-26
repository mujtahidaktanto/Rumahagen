"use client";

// components/admin/PathCardActions.tsx — "Edit"/"+ Versi" per kartu Awarding Path: PUT /awarding-paths/{id} { code, name } + PATCH /awarding-paths/{id}/status { status } (dua endpoint
// terpisah, dipanggil berurutan saat Simpan) dan POST /awarding-paths/{id}/versions { version_no, status?, effective_from?, effective_to? }. TIDAK ADA field "Rule Version terkait" — tidak
// ada endpoint REST untuk menautkan awarding_path_rules (N:N), dicatat di audit/FRONTEND_GAPS.md.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { AwardingPathRow, PathVersionStatus } from "@/lib/admin/awarding-path-data";
import { ApiClientError, api } from "@/lib/api-client";

export function PathCardActions({ path }: { path: AwardingPathRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [code, setCode] = useState(path.code);
  const [name, setName] = useState(path.name);
  const [status, setStatus] = useState(path.status);
  const [versionNo, setVersionNo] = useState(String((path.versions[0]?.versionNo ?? 0) + 1));
  const [versionStatus, setVersionStatus] = useState<PathVersionStatus>("draft");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveEdit() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/awarding-paths/${path.id}`, { code: code.trim(), name: name.trim() }, { idempotency: true });
      if (status.trim() !== path.status) {
        await api.patch(`/awarding-paths/${path.id}/status`, { status: status.trim() }, { idempotency: true });
      }
      setEditOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveVersion() {
    setBusy(true);
    setError(null);
    try {
      await api.post(
        `/awarding-paths/${path.id}/versions`,
        {
          version_no: Number(versionNo),
          status: versionStatus,
          effective_from: effectiveFrom ? new Date(effectiveFrom).toISOString() : undefined,
          effective_to: effectiveTo ? new Date(effectiveTo).toISOString() : undefined,
        },
        { idempotency: true },
      );
      setVersionOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Versi belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setCode(path.code);
          setName(path.name);
          setStatus(path.status);
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
          setVersionNo(String((path.versions[0]?.versionNo ?? 0) + 1));
          setVersionStatus("draft");
          setEffectiveFrom("");
          setEffectiveTo("");
          setError(null);
          setVersionOpen(true);
        }}
      >
        + Versi
      </Button>

      <Dialog
        open={editOpen}
        onClose={() => (busy ? undefined : setEditOpen(false))}
        title={`Edit — ${path.name}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={code.trim().length === 0 || name.trim().length === 0} onClick={() => void saveEdit()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Kode Path" required>
            {(a) => <Input {...a} value={code} onChange={(e) => setCode(e.target.value)} />}
          </Field>
          <Field label="Nama Path" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Status" hint="Bebas teks (tidak dikunci enum).">
            {(a) => <Input {...a} value={status} onChange={(e) => setStatus(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={versionOpen}
        onClose={() => (busy ? undefined : setVersionOpen(false))}
        title={`Versi Baru — ${path.name}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setVersionOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!versionNo || Number(versionNo) < 1} onClick={() => void saveVersion()}>
              Simpan Versi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Nomor Versi" required>
            {(a) => <Input {...a} type="number" min={1} value={versionNo} onChange={(e) => setVersionNo(e.target.value)} />}
          </Field>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={versionStatus} onChange={(e) => setVersionStatus(e.target.value as PathVersionStatus)}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="retired">retired</option>
              </Select>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Berlaku dari">{(a) => <Input {...a} type="datetime-local" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />}</Field>
            <Field label="Berlaku sampai">{(a) => <Input {...a} type="datetime-local" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />}</Field>
          </div>
          <p className="text-caption">
            Menautkan Rule Version belum bisa dilakukan dari sini — belum ada endpoint untuk menautkan awarding_path_rules (dicatat di audit/FRONTEND_GAPS.md).
          </p>
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
