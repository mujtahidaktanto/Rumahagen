"use client";

// components/shell/NotificationBell.tsx — lonceng notifikasi di topbar (wireframe M08): lencana angka belum dibaca, dan panel berisi notifikasi terbaru. Klik notifikasi = tandai dibaca (PUT
// /api/notifications/{id}/read) lalu buka tujuannya bila ada (lib/agent/notification-link.ts); "Tandai semua dibaca" = PUT /api/notifications/read-all. Empat keadaan panel: kosong, gagal dimuat,
// daftar, memproses. Daftar dibawa dari layout server (dimuat ulang tiap pindah halaman dan setelah menandai dibaca). Panel diakhiri tautan "Lihat semua notifikasi" ke Pusat Notifikasi (/agent/notifikasi).
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { BellIcon } from "@/components/ui/icons";
import { notificationHref, unreadBadge } from "@/lib/agent/notification-link";
import type { ShellNotifications } from "@/lib/agent/shell-data";
import { relativeTimeId } from "@/lib/agent/time";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useDismiss } from "./use-dismiss";

export function NotificationBell({ notifications }: { notifications: ShellNotifications }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close, btnRef);

  const unread = notifications.ok ? notifications.unread : 0;
  const badge = unreadBadge(unread);

  async function openItem(id: string, isRead: boolean, href: string | null) {
    setError(null);
    try {
      if (!isRead) await api.put(`/notifications/${id}/read`);
      setOpen(false);
      if (href) router.push(href as Route);
      else router.refresh();
    } catch {
      setError("Belum bisa menandai dibaca. Coba lagi.");
    }
  }

  async function readAll() {
    setBusy(true);
    setError(null);
    try {
      await api.put("/notifications/read-all");
      router.refresh();
    } catch {
      setError("Belum bisa menandai semua dibaca. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50"
      >
        <BellIcon size={22} />
        {badge ? (
          <span aria-hidden="true" className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-danger-600 px-1 text-[10px] leading-none font-extrabold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div id={panelId} role="dialog" aria-label="Notifikasi" className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-ink-100 bg-white shadow-3">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
            <span className="text-title-md">Notifikasi</span>
            {notifications.ok && unread > 0 ? (
              <button type="button" onClick={() => void readAll()} disabled={busy} className="min-h-9 text-label-lg text-blue-600 disabled:opacity-50">
                Tandai semua dibaca
              </button>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="border-b border-ink-100 px-4 py-2 text-caption text-danger-600">
              {error}
            </p>
          ) : null}
          {!notifications.ok ? (
            <p role="alert" className="px-4 py-8 text-center text-body-md text-ink-500">
              Notifikasi gagal dimuat. Muat ulang halaman ini.
            </p>
          ) : notifications.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-body-md text-ink-500">Belum ada notifikasi.</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {notifications.items.map((n) => (
                <li key={n.id} className="border-b border-ink-50 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => void openItem(n.id, n.isRead, notificationHref(n.entityType, n.entityId))}
                    className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-50", !n.isRead && "bg-blue-50/60")}
                  >
                    <span aria-hidden="true" className={cn("mt-1.5 h-2 w-2 flex-none rounded-full", n.isRead ? "bg-transparent" : "bg-blue-600")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-body-md break-words", !n.isRead && "font-bold")}>{n.title}</span>
                      {n.message ? <span className="block text-caption break-words [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{n.message}</span> : null}
                      <span className="text-caption">{relativeTimeId(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-ink-100">
            <Link href={"/agent/notifikasi" as Route} onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center px-4 text-label-lg text-blue-600 no-underline hover:bg-ink-50 hover:no-underline">
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
