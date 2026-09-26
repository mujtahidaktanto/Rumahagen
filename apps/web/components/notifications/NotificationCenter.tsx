// components/notifications/NotificationCenter.tsx — Pusat Notifikasi (M08, wireframe 06-Bersama/M08-Pusat-Notifikasi), satu layar untuk semua persona (Kembali mengikuti persona). Filter Semua/Belum dibaca,
// "Tampilkan yang disembunyikan", "Tandai semua dibaca", dan "Muat Lebih Banyak" lewat URL (server-render). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Tujuan tiap notifikasi dipetakan
// klien dari entitas terkait (lib/agent/notification-link.ts); jenis tanpa layar tujuan tidak punya tombol Buka.
import Link from "next/link";
import type { Route } from "next";
import { NotificationRowActions, MarkAllReadButton } from "@/components/notifications/NotificationControls";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { NotificationCenterData } from "@/lib/agent/notification-data";
import { notificationHref } from "@/lib/agent/notification-link";
import { AREA_HOME, NOTIFICATION_PAGE_SIZE, notificationQuery, notificationType, notificationsPath, type NotificationArea, type NotificationSearch } from "@/lib/agent/notification-rules";
import { relativeTimeId } from "@/lib/agent/time";
import { cn } from "@/lib/cn";

const nf = new Intl.NumberFormat("id-ID");

export function NotificationCenter({ data, search, area, now = new Date() }: { data: NotificationCenterData; search: NotificationSearch; area: NotificationArea; now?: Date }) {
  const base = notificationsPath(area);
  const list = data.list.ok ? data.list.data : null;
  const unread = data.unread.ok ? data.unread.data : null;
  const chips = [
    { key: "semua", label: "Semua" },
    { key: "belum", label: "Belum dibaca" },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5 p-4 lg:p-8">
      <Link href={AREA_HOME[area] as Route} className="w-fit text-[13px] text-ink-500">
        ← Kembali
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Notifikasi</h1>
          <p className="text-body-md text-ink-500">{unread === null ? "Jumlah belum dibaca tidak bisa dimuat" : `${nf.format(unread)} belum dibaca`}</p>
        </div>
        <MarkAllReadButton disabled={!unread} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter notifikasi" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link
              key={c.key}
              href={`${base}${notificationQuery(search, { filter: c.key, tampil: NOTIFICATION_PAGE_SIZE })}` as Route}
              aria-current={search.filter === c.key ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
                search.filter === c.key ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
              )}
            >
              {c.label}
            </Link>
          ))}
        </nav>
        <Link href={`${base}${notificationQuery(search, { tersembunyi: !search.tersembunyi })}` as Route} className="text-label-lg text-blue-600">
          {search.tersembunyi ? "Jangan tampilkan yang disembunyikan" : "Tampilkan yang disembunyikan"}
        </Link>
      </div>

      {!list ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Notifikasi gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={`${base}${notificationQuery(search)}` as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : list.items.length === 0 ? (
        <div className="rounded-md bg-white">
          <EmptyState
            title={search.filter === "belum" ? "Tidak ada notifikasi yang belum dibaca" : "Belum ada notifikasi"}
            message={search.filter === "belum" ? "Semua notifikasi sudah dibaca." : "Pemberitahuan dari tim RumahAgen dan sistem akan muncul di sini."}
          />
          {search.filter === "belum" ? (
            <div className="flex justify-center pb-10">
              <LinkButton href={`${base}${notificationQuery(search, { filter: "semua" })}` as Route} variant="secondary" size="sm">
                Lihat Semua
              </LinkButton>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {list.items.map((n) => {
              const t = notificationType(n.type);
              const href = notificationHref(n.entityType, n.entityId, area);
              return (
                <li key={n.id} className={cn("flex flex-wrap items-start gap-x-4 gap-y-3 rounded-md border p-4", n.isRead ? "border-ink-100 bg-white" : "border-blue-200 bg-blue-50", n.dismissed && "opacity-70")}>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.isRead ? <span aria-label="Belum dibaca" className="h-2 w-2 flex-none rounded-full bg-blue-600" /> : null}
                      <span className={cn("break-words text-label-lg", n.isRead ? "text-ink-700" : "text-ink-900")}>{n.title}</span>
                      <Badge tone={t.tone}>{t.label}</Badge>
                      {n.dismissed ? <Badge tone="neutral">Disembunyikan</Badge> : null}
                    </div>
                    {n.message ? <p className="text-body-md break-words text-ink-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">{n.message}</p> : null}
                    <p className="text-caption">
                      {relativeTimeId(n.createdAt, now)}
                      {n.deliveryStatus === "failed" ? " · Pengiriman ke kanal lain gagal (tetap tampil di sini)" : ""}
                    </p>
                  </div>
                  <NotificationRowActions id={n.id} isRead={n.isRead} href={href} dismissed={n.dismissed} />
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col items-center gap-2.5 pt-1">
            <span className="text-caption">
              Menampilkan {list.items.length} dari {nf.format(list.total)} notifikasi
            </span>
            {list.items.length < list.total ? (
              <LinkButton href={`${base}${notificationQuery(search, { tampil: search.tampil + NOTIFICATION_PAGE_SIZE })}` as Route} variant="secondary">
                Muat Lebih Banyak
              </LinkButton>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
