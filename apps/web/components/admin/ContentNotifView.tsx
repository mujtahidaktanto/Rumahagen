"use client";

// components/admin/ContentNotifView.tsx — Konten & Notifikasi (M09, wireframe 02-Admin/M09-Konten-Notifikasi): 4 tab. Izin BERBEDA per tab (bukan satu gate untuk seluruh halaman):
// Banner & Promosi dan Konten Publik = Superadmin+Admin (m11.announcement_promotion.publish / m11.static_public_content.publish); Template Notifikasi = Superadmin+Admin+Manager
// (m09.notification_template_content.configure); Kirim Manual = Superadmin+Admin (dicek DI DALAM create_notification(), Manager ditolak 403 kalau memaksa).
// "use client" WAJIB: meneruskan prop fungsi `trigger` ke BannerFormDialog/NotificationTemplateFormDialog/SendNotificationDialog (bukti staging 2026-09-30, digest 606953783 — lihat SystemConfigView.tsx).
import Link from "next/link";
import type { Route } from "next";
import { BannerFormDialog } from "@/components/admin/BannerFormDialog";
import { NotificationTemplateFormDialog } from "@/components/admin/NotificationTemplateFormDialog";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { BannerRow, NotificationTemplateRow } from "@/lib/admin/content-notif-data";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { bannerStatus } from "@/lib/admin/content-notif-rules";
import { NOTIFICATION_TYPE } from "@/lib/agent/notification-rules";
import { formatDateTime } from "@/lib/format";

export type ContentTab = "banner" | "konten" | "template" | "kirim";
const TABS: { key: ContentTab; label: string }[] = [
  { key: "banner", label: "Banner & Promosi" },
  { key: "konten", label: "Konten Publik" },
  { key: "template", label: "Template Notifikasi" },
  { key: "kirim", label: "Kirim Manual" },
];

export function ContentNotifView({
  tab,
  canManageBanner,
  canManageTemplate,
  canSendManual,
  banners,
  templates,
  users,
}: {
  tab: ContentTab;
  canManageBanner: boolean;
  canManageTemplate: boolean;
  canSendManual: boolean;
  banners: Part<BannerRow[]>;
  templates: Part<NotificationTemplateRow[]>;
  users: Part<DirectoryUserRow[]>;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Konten &amp; Notifikasi</h1>
        {tab === "banner" && canManageBanner ? <BannerFormDialog trigger={(open) => <Button onClick={open}>+ Buat Banner</Button>} /> : null}
        {tab === "kirim" && canSendManual && users.ok ? <SendNotificationDialog users={users.data} trigger={(open) => <Button onClick={open}>+ Kirim Notifikasi</Button>} /> : null}
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-ink-100 px-4 lg:px-8">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/konten?tab=${t.key}` as Route} className={`flex-none border-b-2 py-3.5 text-label-lg font-bold no-underline hover:no-underline ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {tab === "banner" ? (
          !canManageBanner ? <p className="text-body-md text-ink-500">Anda hanya bisa melihat banner. Mengubah membutuhkan izin mengelola banner &amp; promosi.</p> : null
        ) : null}
        {tab === "banner" ? (
          !banners.ok ? (
            <ErrorState title="Banner gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : banners.data.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-body-md text-ink-500">Belum ada banner. Buat banner pertama untuk tampil di halaman Promo &amp; Pengumuman.</p>
              {canManageBanner ? (
                <div className="mt-4 flex justify-center">
                  <BannerFormDialog trigger={(open) => <Button onClick={open}>+ Buat Banner</Button>} />
                </div>
              ) : null}
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
              {banners.data.map((b) => {
                const st = bannerStatus(b.status);
                return (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="break-words text-body-md text-ink-900">{b.title}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <p className="text-caption">
                        Prioritas {b.priority}
                        {b.scheduleAt ? ` · Mulai ${formatDateTime(b.scheduleAt)}` : ""}
                        {b.expiresAt ? ` · Berakhir ${formatDateTime(b.expiresAt)}` : ""}
                      </p>
                    </div>
                    {canManageBanner ? <BannerFormDialog banner={b} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} /> : null}
                  </li>
                );
              })}
            </ul>
          )
        ) : null}

        {tab === "konten" ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-md text-ink-500">Hanya Superadmin dan Admin yang bisa mengubah konten publik; Manager hanya melihat.</p>
            <ErrorState title="Konten Publik belum tersedia di layar ini" message="Tabel static_public_content sudah ada di database, tetapi belum ada satu pun route API yang membacanya/menulisnya (bukan cuma UI yang kurang) — lihat audit/FRONTEND_GAPS.md. Menunggu keputusan menambah API baru sebelum tab ini bisa dibangun." />
          </div>
        ) : null}

        {tab === "template" ? (
          !templates.ok ? (
            <ErrorState title="Template gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
          ) : (
            <>
              <p className="text-body-md text-ink-500">6 tipe terkunci CHECK constraint sejak migration 0013 — hanya bisa diubah isinya, tidak ada tipe baru.</p>
              <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
                {templates.data.map((t) => (
                  <li key={t.type} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-caption">{t.type}</span>
                        <Badge tone="info">{NOTIFICATION_TYPE[t.type]?.label ?? t.type}</Badge>
                        {!t.isActive ? <Badge tone="neutral">Nonaktif</Badge> : null}
                      </div>
                      <p className="break-words text-body-md text-ink-900">{t.titleTemplate}</p>
                      <p className="break-words text-caption">{t.messageTemplate}</p>
                    </div>
                    {canManageTemplate ? <NotificationTemplateFormDialog template={t} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Edit</Button>} /> : null}
                  </li>
                ))}
              </ul>
            </>
          )
        ) : null}

        {tab === "kirim" ? (
          <div className="flex max-w-lg flex-col gap-3">
            <p className="text-body-md text-ink-500">Kirim notifikasi manual ke SATU akun — bukan broadcast massal. Dibungkus fungsi create_notification(), satu-satunya jalur fisik pembuatan notifikasi.</p>
            {!canSendManual ? <p className="text-body-md text-ink-500">Kirim notifikasi manual hanya untuk Superadmin/Admin — Manager tidak diberi grant create_notification() untuk pemanggilan manual ini.</p> : null}
            {canSendManual ? (
              !users.ok ? (
                <ErrorState title="Daftar akun gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
              ) : (
                <SendNotificationDialog users={users.data} trigger={(open) => <Button onClick={open}>+ Kirim Notifikasi</Button>} />
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
