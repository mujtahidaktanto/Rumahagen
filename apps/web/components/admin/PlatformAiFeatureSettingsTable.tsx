"use client";

// components/admin/PlatformAiFeatureSettingsTable.tsx — Bagian 3 tab Koneksi AI RumahAgen
// (docs/platform-ai-spec.md "Bagian 3: Pemakaian per fitur"): model utama/cadangan hanya dari
// provider yang TERHUBUNG (status='active'), batas harian/anggaran, aktif/nonaktif. Pengaturan
// lanjutan (temperature/max_output_tokens) di balik tombol "Lanjutan" per baris. Simpan eksplisit
// per baris (bukan autosave), pola sama seperti form lain di repo ini.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { ApiClientError, api } from "@/lib/api-client";
import type { PlatformFeatureSettingRow, PlatformProviderRow } from "@/lib/admin/platform-ai-data";

type ModelOption = { id: string; label: string };

type RowForm = {
  isEnabled: boolean;
  primaryModelId: string;
  fallbackModelId: string;
  perUserDailyLimit: string;
  globalDailyLimit: string;
  monthlyBudgetUsd: string;
  temperature: string;
  maxOutputTokens: string;
};

function formFrom(f: PlatformFeatureSettingRow): RowForm {
  return {
    isEnabled: f.isEnabled,
    primaryModelId: f.primaryModelId ?? "",
    fallbackModelId: f.fallbackModelId ?? "",
    perUserDailyLimit: String(f.perUserDailyLimit),
    globalDailyLimit: String(f.globalDailyLimit),
    monthlyBudgetUsd: String(f.monthlyBudgetUsd),
    temperature: String(f.temperature),
    maxOutputTokens: String(f.maxOutputTokens),
  };
}

function FeatureRow({ feature, modelOptions }: { feature: PlatformFeatureSettingRow; modelOptions: ModelOption[] }) {
  const router = useRouter();
  const initial = formFrom(feature);
  const [f, setF] = useState<RowForm>(initial);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);

  function set<K extends keyof RowForm>(k: K, v: RowForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setSaved(false);
    setError(null);
  }

  async function save() {
    if (f.isEnabled && !f.primaryModelId) return setError("Pilih model utama dulu sebelum mengaktifkan.");
    if (f.fallbackModelId && f.fallbackModelId === f.primaryModelId) return setError("Model cadangan tidak boleh sama dengan model utama.");
    setBusy(true);
    setError(null);
    try {
      await api.put(
        `/admin/platform-ai-feature-settings/${feature.featureCode}`,
        {
          is_enabled: f.isEnabled,
          primary_model_id: f.primaryModelId || null,
          fallback_model_id: f.fallbackModelId || null,
          per_user_daily_limit: Number(f.perUserDailyLimit),
          global_daily_limit: Number(f.globalDailyLimit),
          monthly_budget_usd: Number(f.monthlyBudgetUsd),
          temperature: Number(f.temperature),
          max_output_tokens: Number(f.maxOutputTokens),
        },
        { idempotency: true },
      );
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Pengaturan gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-label-lg text-ink-900">{feature.displayName}</span>
        <label className="flex items-center gap-2">
          <Switch checked={f.isEnabled} onChange={(on) => set("isEnabled", on)} disabled={!f.primaryModelId && !feature.primaryModelId} aria-label={`Aktifkan ${feature.displayName}`} />
          <span className="text-caption">{f.isEnabled ? "Aktif" : "Nonaktif"}</span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Model utama">
          {(a) => (
            <Select {...a} value={f.primaryModelId} onChange={(e) => set("primaryModelId", e.target.value)}>
              <option value="">Belum dipilih</option>
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Cadangan">
          {(a) => (
            <Select {...a} value={f.fallbackModelId} onChange={(e) => set("fallbackModelId", e.target.value)}>
              <option value="">Tanpa cadangan</option>
              {modelOptions
                .filter((m) => m.id !== f.primaryModelId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Batas per user/hari">{(a) => <Input {...a} inputMode="numeric" value={f.perUserDailyLimit} onChange={(e) => set("perUserDailyLimit", e.target.value)} />}</Field>
        <Field label="Batas total/hari">{(a) => <Input {...a} inputMode="numeric" value={f.globalDailyLimit} onChange={(e) => set("globalDailyLimit", e.target.value)} />}</Field>
        <Field label="Anggaran/bulan (USD)">{(a) => <Input {...a} inputMode="decimal" value={f.monthlyBudgetUsd} onChange={(e) => set("monthlyBudgetUsd", e.target.value)} />}</Field>
      </div>

      <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setAdvanced((s) => !s)}>
        {advanced ? "Sembunyikan Lanjutan" : "Lanjutan"}
      </Button>
      {advanced ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Temperature" hint="0 – 1,5">
            {(a) => <Input {...a} inputMode="decimal" value={f.temperature} onChange={(e) => set("temperature", e.target.value)} />}
          </Field>
          <Field label="Maks token keluaran" hint="200 – 4000">
            {(a) => <Input {...a} inputMode="numeric" value={f.maxOutputTokens} onChange={(e) => set("maxOutputTokens", e.target.value)} />}
          </Field>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-3">
        {saved && !dirty ? (
          <span role="status" className="text-caption text-success-600">
            Tersimpan.
          </span>
        ) : null}
        <Button size="sm" loading={busy} disabled={!dirty} onClick={() => void save()}>
          Simpan
        </Button>
      </div>
    </div>
  );
}

export function PlatformAiFeatureSettingsTable({ features, providers }: { features: PlatformFeatureSettingRow[]; providers: PlatformProviderRow[] }) {
  const modelOptions: ModelOption[] = providers
    .filter((p) => p.connection?.status === "active")
    .flatMap((p) => p.models.filter((m) => m.status === "active").map((m) => ({ id: m.id, label: `${p.displayName} · ${m.displayName}` })));

  if (features.length === 0) return <p className="py-10 text-center text-body-md text-ink-500">Belum ada pengaturan fitur.</p>;

  return (
    <div className="flex flex-col gap-3.5">
      {modelOptions.length === 0 ? <Badge tone="warning">Belum ada provider terhubung — hubungkan salah satu provider di atas dulu.</Badge> : null}
      {features.map((f) => (
        <FeatureRow key={f.featureCode} feature={f} modelOptions={modelOptions} />
      ))}
    </div>
  );
}
