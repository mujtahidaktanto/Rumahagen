"use client";

// components/admin/SystemConfigKeyDialog.tsx — Tambah/Ubah Config Key generik (Konfigurasi Sistem, tab System Config): PUT /admin/config/system/{key} { config_value } (upsert). Key-value generik
// (system_configs, migration 0011) untuk kebutuhan operasional mendatang di luar 7 kunci listing_quota.* yang punya tab sendiri. Pola sama seperti ConfigKeyFormDialog (Ekonomi Pembelajaran).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { SystemConfigRow } from "@/lib/admin/system-config-data";
import { ApiClientError, api } from "@/lib/api-client";

export function SystemConfigKeyDialog({ config, trigger }: { config?: SystemConfigRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!config;
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(config?.key ?? "");
  const [value, setValue] = useState(config?.value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setKey(config?.key ?? "");
    setValue(config?.value ?? "");
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/config/system/${encodeURIComponent(key.trim())}`, { config_value: value.trim() || null }, { idempotency: true });
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
        title={isEdit ? `Ubah — ${config.key}` : "Tambah Config Key"}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={key.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Key" required>
            {(a) => <Input {...a} className="font-mono" value={key} onChange={(e) => setKey(e.target.value)} disabled={isEdit} placeholder="mis. maintenance_banner_message" />}
          </Field>
          <Field label="Value">{(a) => <Input {...a} value={value} onChange={(e) => setValue(e.target.value)} />}</Field>
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
