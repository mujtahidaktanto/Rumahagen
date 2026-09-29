// components/admin/SystemConfigView.tsx — Konfigurasi Sistem (M09, wireframe 02-Admin/M09-Konfigurasi-Sistem): tab System Config (key-value generik), SEO Config, Kuota Listing. Superadmin-only
// untuk mengubah (m09.system_configuration.manage) — Admin/Manager melihat "Akses Ditolak" utuh (bukan cuma tombol simpan disembunyikan), mengikuti wireframe apa adanya karena kedua sub-resource
// digerbangi permission yang sama persis dan tidak ada state "lihat saja" di dokumen sumber untuk layar ini.
import Link from "next/link";
import type { Route } from "next";
import { QuotaConfigForm } from "@/components/admin/QuotaConfigForm";
import { SeoConfigForm } from "@/components/admin/SeoConfigForm";
import { SystemConfigKeyDialog } from "@/components/admin/SystemConfigKeyDialog";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import { otherConfigRows, quotaFormFrom, type SeoConfig, type SystemConfigRow } from "@/lib/admin/system-config-data";
import { formatDateTime } from "@/lib/format";

export type ConfigTab = "system" | "seo" | "kuota";

const TABS: { key: ConfigTab; label: string }[] = [
  { key: "system", label: "System Config" },
  { key: "seo", label: "SEO Config" },
  { key: "kuota", label: "Kuota Listing" },
];

export function SystemConfigView({ tab, canManage, configs, seo }: { tab: ConfigTab; canManage: boolean; configs: Part<SystemConfigRow[]>; seo: Part<SeoConfig | null> }) {
  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
        <h1 className="mb-4 text-headline">Konfigurasi Sistem</h1>
        <ErrorState title="Akses Ditolak" message="System Configuration dan SEO Configuration keduanya digerbangi permission m09.system_configuration.manage, hanya diberikan ke Superadmin — bahkan Admin tidak lolos." />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Konfigurasi Sistem</h1>
        {tab === "system" ? <SystemConfigKeyDialog trigger={(open) => <Button onClick={open}>+ Tambah Config Key</Button>} /> : null}
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-ink-100 px-4 lg:px-8">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/konfigurasi?tab=${t.key}` as Route} className={`flex-none border-b-2 py-3.5 text-label-lg font-bold no-underline hover:no-underline ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "kuota" ? (
          !configs.ok ? (
            <ErrorState title="Pengaturan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <QuotaConfigForm initial={quotaFormFrom(configs.data)} readOnly={false} />
          )
        ) : null}

        {tab === "seo" ? (
          !seo.ok ? (
            <ErrorState title="Pengaturan SEO gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : !seo.data ? (
            <p className="text-body-md text-ink-500">Belum ada baris seo_config (migration 0097 belum menyeed baris awal).</p>
          ) : (
            <SeoConfigForm initial={seo.data} readOnly={false} />
          )
        ) : null}

        {tab === "system" ? (
          !configs.ok ? (
            <ErrorState title="Config key gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="max-w-xl text-body-md text-ink-500">
                Key-value generik (<code className="font-mono text-caption">system_configs</code>) — kunci <code className="font-mono text-caption">listing_quota.*</code> (7 kunci) diatur di tab Kuota
                Listing; daftar di bawah untuk key lain yang bebas dipakai kebutuhan operasional mendatang.
              </p>
              {(() => {
                const rows = otherConfigRows(configs.data);
                return rows.length === 0 ? (
                  <p className="py-10 text-center text-body-md text-ink-500">Belum ada config key yang dibuat.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
                    {rows.map((r) => (
                      <li key={r.key} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                        <div className="min-w-0">
                          <p className="font-mono text-body-md break-all text-ink-900">{r.key}</p>
                          <p className="break-all text-caption">{r.value ?? "—"}</p>
                          <p className="text-caption">Diubah {formatDateTime(r.updatedAt)}</p>
                        </div>
                        <SystemConfigKeyDialog config={r} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} />
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </>
          )
        ) : null}
      </div>
    </div>
  );
}
