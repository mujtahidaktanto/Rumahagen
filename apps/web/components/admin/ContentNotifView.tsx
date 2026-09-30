"use client";

// components/admin/ContentNotifView.tsx — Konten & Notifikasi (M09, wireframe 02-Admin/M09-Konten-Notifikasi): 5 tab. Izin BERBEDA per tab (bukan satu gate untuk seluruh halaman):
// Banner Hero Beranda, Banner & Promosi, dan Konten Publik = Superadmin+Admin (m11.static_public_content.publish / m11.announcement_promotion.publish); Template Notifikasi =
// Superadmin+Admin+Manager (m09.notification_template_content.configure); Kirim Manual = Superadmin+Admin (dicek DI DALAM create_notification(), Manager ditolak 403 kalau memaksa).
// Banner Hero Beranda (home_hero_banners, migration 0167) TIDAK SAMA dengan Banner & Promosi (public_announcement_promotion, 0014/0028) — yang pertama slide di blok hero
// Homepage (app/(publik)/page.tsx), yang kedua kartu di halaman /promo. Keduanya bernama "banner" sehari-hari sehingga sering tertukar — label tab dibuat eksplisit berbeda.
// "use client" WAJIB: meneruskan prop fungsi `trigger` ke BannerFormDialog/NotificationTemplateFormDialog/SendNotificationDialog (bukti staging 2026-09-30, digest 606953783 — lihat SystemConfigView.tsx).
import Link from "next/link";
import type { Route } from "next";
import { BannerFormDialog } from "@/components/admin/BannerFormDialog";
import { BannerRowActions } from "@/components/admin/BannerRowActions";
import { HeroBannerFormDialog } from "@/components/admin/HeroBannerFormDialog";
import { HeroBannerRowActions } from "@/components/admin/HeroBannerRowActions";
import { NotificationTemplateFormDialog } from "@/components/admin/NotificationTemplateFormDialog";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { Part } from "@/lib/agent/dashboard-data";
import type { BannerRow, HeroBannerRow, NotificationTemplateRow, StaticContentRow } from "@/lib/admin/content-notif-data";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { bannerStatus } from "@/lib/admin/content-notif-rules";
import { staticContentStatus } from "@/lib/admin/static-content-rules";
import { NOTIFICATION_TYPE } from "@/lib/agent/notification-rules";
import { formatDateTime } from "@/lib/format";

export type ContentTab = "hero" | "banner" | "konten" | "template" | "kirim";
const TABS: { key: ContentTab; label: string }[] = [
  { key: "hero", label: "Banner Hero Beranda" },
  { key: "banner", label: "Banner & Promosi" },
  { key: "konten", label: "Konten Publik" },
  { key: "template", label: "Template Notifikasi" },
  { key: "kirim", label: "Kirim Manual" },
];

export function ContentNotifView({
  tab,
  canManageHero,
  heroBanners,
  canManageBanner,
  canManageTemplate,
  canSendManual,
  banners,
  templates,
  canManageContent,
  users,
  staticContent,
}: {
  tab: ContentTab;
  canManageHero: boolean;
  heroBanners: Part<HeroBannerRow[]>;
  canManageBanner: boolean;
  canManageTemplate: boolean;
  canSendManual: boolean;
  canManageContent: boolean;
  banners: Part<BannerRow[]>;
  templates: Part<NotificationTemplateRow[]>;
  users: Part<DirectoryUserRow[]>;
  staticContent: Part<StaticContentRow[]>;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Konten &amp; Notifikasi</h1>
        {tab === "hero" && canManageHero ? <HeroBannerFormDialog trigger={(open) => <Button onClick={open}>+ Buat Slide</Button>} /> : null}
        {tab === "banner" && canManageBanner ? <BannerFormDialog trigger={(open) => <Button onClick={open}>+ Buat Banner</Button>} /> : null}
        {tab === "konten" && canManageContent ? <LinkButton href={"/admin/konten/konten-publik/baru" as Route}>+ Buat Halaman</LinkButton> : null}
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
        {tab === "hero" ? (
          <>
            <p className="text-body-md text-ink-500">Slide tampil bergantian di blok hero Homepage (samping kotak pencarian). Urutan tampil = angka kecil dulu; hanya slide Aktif yang tampil publik.</p>
            {!canManageHero ? <p className="text-body-md text-ink-500">Anda hanya bisa melihat. Mengubah membutuhkan izin mengelola konten publik.</p> : null}
            {!heroBanners.ok ? (
              <ErrorState title="Slide banner gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            ) : heroBanners.data.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-body-md text-ink-500">Belum ada slide. Tanpa slide aktif, blok hero menampilkan latar biru bawaan.</p>
                {canManageHero ? (
                  <div className="mt-4 flex justify-center">
                    <HeroBannerFormDialog trigger={(open) => <Button onClick={open}>+ Buat Slide</Button>} />
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
                {heroBanners.data.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-18 flex-none items-center justify-center overflow-hidden rounded-sm bg-ink-100 text-caption">
                        {/* Pratinjau gambar slide; gambar biasa tanpa optimasi Next. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.imageReference} alt="" className="h-full w-full object-cover" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="break-words text-body-md text-ink-900">{b.altText || "(tanpa teks alternatif)"}</span>
                          <Badge tone={b.isActive ? "success" : "neutral"}>{b.isActive ? "Aktif" : "Nonaktif"}</Badge>
                        </div>
                        <p className="text-caption">Urutan {b.displayOrder}</p>
                      </div>
                    </div>
                    {canManageHero ? <HeroBannerRowActions banner={b} /> : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

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
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-18 flex-none items-center justify-center overflow-hidden rounded-sm bg-ink-100 text-caption">
                        {b.imageReference ? (
                          // Pratinjau gambar banner; gambar biasa tanpa optimasi Next.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imageReference} alt="" className="h-full w-full object-cover" />
                        ) : (
                          "—"
                        )}
                      </span>
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
                    </div>
                    {canManageBanner ? <BannerRowActions banner={b} /> : null}
                  </li>
                );
              })}
            </ul>
          )
        ) : null}

        {tab === "konten" ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-md text-ink-500">Hanya Superadmin dan Admin yang bisa mengubah konten publik; Manager hanya melihat.</p>
            {!staticContent.ok ? (
              <ErrorState title="Konten publik gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            ) : staticContent.data.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-body-md text-ink-500">Belum ada halaman konten publik.</p>
                {canManageContent ? (
                  <div className="mt-4 flex justify-center">
                    <LinkButton href={"/admin/konten/konten-publik/baru" as Route}>+ Buat Halaman</LinkButton>
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
                {staticContent.data.map((c) => {
                  const st = staticContentStatus(c.status);
                  return (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="break-words text-body-md text-ink-900">{c.title}</span>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </div>
                        <p className="font-mono text-caption">/konten/{c.slug}</p>
                        <p className="text-caption">Diubah {formatDateTime(c.updatedAt)}</p>
                      </div>
                      <LinkButton href={`/admin/konten/konten-publik/${c.id}` as Route} variant="secondary" size="sm">
                        {canManageContent ? "Ubah" : "Lihat"}
                      </LinkButton>
                    </li>
                  );
                })}
              </ul>
            )}
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
