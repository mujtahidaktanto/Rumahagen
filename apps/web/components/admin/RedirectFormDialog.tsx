"use client";

// components/admin/RedirectFormDialog.tsx — Buat/Ubah Pengalihan URL (M11): POST /url-redirects atau PUT /url-redirects/{id} (PUT = ganti penuh, migration 0051). old_path unik — 409 kalau
// sudah dipakai redirect lain (ditampilkan apa adanya dari server).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { RedirectRow } from "@/lib/admin/url-redirect-data";
import { REDIRECT_REASON_LABEL, validateRedirectForm } from "@/lib/admin/url-redirect-rules";
import { ApiClientError, api } from "@/lib/api-client";

type Form = { oldPath: string; newPath: string; redirectType: 301 | 302; reason: string };
function formFrom(r?: RedirectRow): Form {
  return { oldPath: r?.oldPath ?? "", newPath: r?.newPath ?? "", redirectType: (r?.redirectType as 301 | 302) ?? 301, reason: r?.reason ?? "" };
}

export function RedirectFormDialog({ redirect, trigger }: { redirect?: RedirectRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!redirect;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(formFrom(redirect));
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = tried ? validateRedirectForm(f.oldPath, f.newPath) : {};

  function openDialog() {
    setF(formFrom(redirect));
    setTried(false);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setTried(true);
    const errs = validateRedirectForm(f.oldPath, f.newPath);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    const body = { old_path: f.oldPath.trim(), new_path: f.newPath.trim(), redirect_type: f.redirectType, reason: f.reason || undefined };
    try {
      if (isEdit) await api.put(`/url-redirects/${redirect.id}`, body, { idempotency: true });
      else await api.post("/url-redirects", body, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={isEdit ? "Ubah Pengalihan URL" : "Buat Pengalihan URL"}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Jalur lama" required hint="Diawali / (mis. /listing/rumah-lama)" error={errors.oldPath}>
            {(a) => <Input {...a} className="font-mono" value={f.oldPath} onChange={(e) => setF((x) => ({ ...x, oldPath: e.target.value }))} />}
          </Field>
          <Field label="Jalur baru" required hint="Diawali / (mis. /listing/rumah-baru)" error={errors.newPath}>
            {(a) => <Input {...a} className="font-mono" value={f.newPath} onChange={(e) => setF((x) => ({ ...x, newPath: e.target.value }))} />}
          </Field>
          <Field label="Tipe pengalihan">
            {(a) => (
              <Select {...a} value={f.redirectType} onChange={(e) => setF((x) => ({ ...x, redirectType: Number(e.target.value) as 301 | 302 }))}>
                <option value={301}>301 — Permanen</option>
                <option value={302}>302 — Sementara</option>
              </Select>
            )}
          </Field>
          <Field label="Alasan (opsional)">
            {(a) => (
              <Select {...a} value={f.reason} onChange={(e) => setF((x) => ({ ...x, reason: e.target.value }))}>
                <option value="">—</option>
                {Object.entries(REDIRECT_REASON_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
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
