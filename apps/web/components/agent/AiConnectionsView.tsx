// components/agent/AiConnectionsView.tsx — Koneksi AI Saya (M13 BYOK, wireframe 01-Agent/M13-Koneksi-AI): daftar koneksi milik sendiri + Tambah Koneksi. Tiap baris: nama provider, billing, tanggal
// terhubung, status (badge = CHECK constraint agent_ai_connections.status), dan aksi Test/Putuskan sesuai status. RumahAgen tidak menanggung biaya pemakaian provider (BYOK).
import type { Route } from "next";
import { AddAiConnectionDialog } from "@/components/agent/AddAiConnectionDialog";
import { AiConnectionRowActions } from "@/components/agent/AiConnectionRowActions";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { SparkleIcon } from "@/components/ui/icons";
import type { AiConnectionsPageData } from "@/lib/agent/ai-data";
import { AI_BILLING_LABEL, AI_CONNECTION_STATUS_LABEL, AI_CONNECTION_STATUS_TONE, canDisconnectConnection, canTestConnection } from "@/lib/agent/ai-rules";

const df = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

export function AiConnectionsView({ data }: { data: AiConnectionsPageData }) {
  const { connections, providers } = data;

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Koneksi AI Saya</h1>
        <div className="flex gap-2.5">
          <LinkButton href={"/agent/ai/asisten" as Route} variant="secondary" size="sm">
            Buka AI Assistant
          </LinkButton>
          {providers.ok ? <AddAiConnectionDialog providers={providers.data} /> : null}
        </div>
      </div>

      <section className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <span className="mb-1 block text-title-md">Bring Your Own Key (BYOK)</span>
          <p className="text-body-md text-ink-500">
            Anda menghubungkan API key milik sendiri ke provider AI pilihan. RumahAgen tidak menanggung biaya pemakaian provider — cek syarat billing tiap provider sebelum menghubungkan.
          </p>
        </div>

        {!connections.ok ? (
          <ErrorState title="Koneksi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : connections.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <SparkleIcon size={26} />
            </span>
            <p className="text-body-md text-ink-500">Belum ada koneksi AI yang dihubungkan.</p>
            {providers.ok && providers.data.length > 0 ? <AddAiConnectionDialog providers={providers.data} label="Tambah Koneksi Pertama" /> : null}
          </div>
        ) : (
          <ul>
            {connections.data.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3.5 last:border-b-0">
                <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <SparkleIcon size={20} />
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-body-md">{c.provider?.displayName ?? "Provider tidak dikenal"}</p>
                  <p className="text-caption">
                    {c.provider ? AI_BILLING_LABEL[c.provider.billingType] : "—"} · Terhubung {df.format(new Date(c.connectedAt))}
                  </p>
                </div>
                <Badge tone={AI_CONNECTION_STATUS_TONE[c.status]}>{AI_CONNECTION_STATUS_LABEL[c.status]}</Badge>
                <AiConnectionRowActions connectionId={c.id} canTest={canTestConnection(c.status)} canDisconnect={canDisconnectConnection(c.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {!providers.ok ? (
        <p className="text-caption text-danger-600">Katalog provider AI gagal dimuat.</p>
      ) : providers.data.length === 0 ? (
        <p className="text-caption">Belum ada provider AI di katalog. Hubungi Superadmin untuk menambahkannya sebelum bisa membuat koneksi baru.</p>
      ) : null}
    </div>
  );
}
