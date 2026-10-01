"use client";

// components/admin/PlatformAiConnectionsView.tsx — isi tab "Koneksi AI RumahAgen" (migration 0174,
// superadmin-only -- halaman pemanggil sudah menjaga, komponen ini tidak mengecek ulang). Bagian 1:
// grid kartu provider (docs/platform-ai-spec.md "Bagian 1: Kartu provider"). Bagian 3: tabel
// pemakaian per fitur di komponen terpisah (PlatformAiFeatureSettingsTable).
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { PlatformFeatureSettingRow, PlatformProviderRow } from "@/lib/admin/platform-ai-data";
import { AI_BILLING_LABEL } from "@/lib/agent/ai-rules";
import { PLATFORM_CONNECTION_STATUS_LABEL, PLATFORM_CONNECTION_STATUS_TONE } from "@/lib/admin/platform-ai-rules";
import { PlatformAiConnectDialog } from "./PlatformAiConnectDialog";
import { PlatformAiFeatureSettingsTable } from "./PlatformAiFeatureSettingsTable";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function ProviderCard({ provider, features }: { provider: PlatformProviderRow; features: PlatformFeatureSettingRow[] }) {
  const status = provider.connection?.status ?? "disabled";
  const connected = status === "active";
  const modelIds = new Set(provider.models.map((m) => m.id));
  const featuresUsing = features.filter((f) => (f.primaryModelId && modelIds.has(f.primaryModelId)) || (f.fallbackModelId && modelIds.has(f.fallbackModelId))).map((f) => f.displayName);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-lg text-ink-900">{provider.displayName}</p>
          <p className="text-caption">{AI_BILLING_LABEL[provider.billingType]}</p>
        </div>
        <Badge tone={PLATFORM_CONNECTION_STATUS_TONE[status]}>{PLATFORM_CONNECTION_STATUS_LABEL[status]}</Badge>
      </div>

      {connected ? (
        <div className="text-caption text-ink-500">
          <p>Key ••••{provider.connection?.keyLast4 ?? "----"}</p>
          {provider.connection?.lastValidatedAt ? <p>Divalidasi {dtf.format(new Date(provider.connection.lastValidatedAt))}</p> : null}
          {featuresUsing.length > 0 ? <p>Dipakai: {featuresUsing.join(", ")}</p> : null}
        </div>
      ) : status === "invalid" && provider.connection?.lastError ? (
        <p className="text-caption text-danger-600">{provider.connection.lastError}</p>
      ) : null}

      <PlatformAiConnectDialog provider={provider} trigger={(open) => <Button variant={connected ? "secondary" : "primary"} size="sm" onClick={open}>{connected ? "Kelola" : "Hubungkan"}</Button>} />
    </div>
  );
}

export function PlatformAiConnectionsView({ providers, featureSettings }: { providers: Part<PlatformProviderRow[]>; featureSettings: Part<PlatformFeatureSettingRow[]> }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-title-md">Koneksi Provider</h2>
        <p className="mb-3.5 text-body-md text-ink-500">Satu API key per provider untuk seluruh platform — bukan BYOK per-agen (itu di tab Koneksi Agent).</p>
        {!providers.ok ? (
          <ErrorState title="Daftar provider gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : providers.data.length === 0 ? (
          <p className="py-10 text-center text-body-md text-ink-500">Belum ada provider platform.</p>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.data.map((p) => (
              <ProviderCard key={p.id} provider={p} features={featureSettings.ok ? featureSettings.data : []} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-1 text-title-md">Pemakaian per Fitur</h2>
        <p className="mb-3.5 text-body-md text-ink-500">Model utama, cadangan, dan batas tiap fitur AI — berlaku langsung tanpa deploy.</p>
        {!providers.ok || !featureSettings.ok ? (
          <ErrorState title="Pengaturan fitur gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <PlatformAiFeatureSettingsTable features={featureSettings.data} providers={providers.data} />
        )}
      </div>
    </div>
  );
}
