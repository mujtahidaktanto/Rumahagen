"use client";

// components/admin/NotificationTemplateFormDialog.tsx — Edit Template (Konten & Notifikasi, tab Template Notifikasi): PUT /admin/notification-templates/{type} { title_template, message_template,
// is_active }. 6 tipe terkunci CHECK constraint sejak migration 0013 — hanya isinya yang bisa diubah, tidak ada tipe baru (tidak ada tombol Tambah).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import type { NotificationTemplateRow } from "@/lib/admin/content-notif-data";
import { ApiClientError, api } from "@/lib/api-client";

export function NotificationTemplateFormDialog({ template, trigger }: { template: NotificationTemplateRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(template.titleTemplate);
  const [message, setMessage] = useState(template.messageTemplate);
  const [active, setActive] = useState(template.isActive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setTitle(template.titleTemplate);
    setMessage(template.messageTemplate);
    setActive(template.isActive);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/notification-templates/${template.type}`, { title_template: title.trim(), message_template: message.trim(), is_active: active }, { idempotency: true });
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
        title={`Edit Template — ${template.type}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!title.trim() || !message.trim()} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Judul" required>
            {(a) => <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          <Field label="Pesan" required hint="Mendukung placeholder mis. {{event_title}}">
            {(a) => <Textarea {...a} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />}
          </Field>
          <label className="flex items-center gap-3">
            <Switch checked={active} onChange={setActive} aria-label="Template aktif" />
            <span className="text-body-md">Template aktif</span>
          </label>
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
