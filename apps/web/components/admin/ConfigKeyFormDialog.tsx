"use client";

// components/admin/ConfigKeyFormDialog.tsx — Tambah/Ubah Config Key (Ekonomi Pembelajaran, tab Konfigurasi Ekonomi): PUT /admin/learning/configuration { config_key, config_value } (upsert —
// key yang sama menimpa nilai lama). Key-value generik (learning_economy_configs, 0109), isi/skema tidak dievidensi Core — murni infrastruktur bebas.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { LearningEconomyConfigRow } from "@/lib/admin/learning-economy-data";
import { ApiClientError, api } from "@/lib/api-client";

export function ConfigKeyFormDialog({ config, trigger }: { config?: LearningEconomyConfigRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!config;
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(config?.configKey ?? "");
  const [value, setValue] = useState(config?.configValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setKey(config?.configKey ?? "");
    setValue(config?.configValue ?? "");
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put("/admin/learning/configuration", { config_key: key.trim(), config_value: value.trim() || null }, { idempotency: true });
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
        title={isEdit ? `Ubah — ${config.configKey}` : "Tambah Config Key"}
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
            {(a) => <Input {...a} className="font-mono" value={key} onChange={(e) => setKey(e.target.value)} disabled={isEdit} placeholder="mis. lp_per_course_completion" />}
          </Field>
          <Field label="Value">
            {(a) => <Input {...a} value={value} onChange={(e) => setValue(e.target.value)} />}
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
