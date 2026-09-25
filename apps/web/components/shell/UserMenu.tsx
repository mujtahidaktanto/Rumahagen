"use client";

// components/shell/UserMenu.tsx — blok pengguna (lingkaran foto/inisial, nama, peran) yang dapat DIKLIK: membuka menu kecil (Profil Saya, Keluar) di atasnya.
// Aksesibilitas: tombol aria-haspopup="menu" + aria-expanded; menu role="menu" dengan item role="menuitem"; Esc menutup dan mengembalikan fokus ke tombol; klik di luar menutup;
// panah atas/bawah memindah fokus antar item. Saat rel diringkas, hanya lingkaran yang tampil (nama/peran tetap ada untuk pembaca layar).
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { ChevronUpIcon, LogoutIcon, UserIcon } from "@/components/ui/icons";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

export type UserMenuUser = { name: string; roleLabel: string; avatarUrl?: string | null };

type UserMenuProps = {
  user: UserMenuUser;
  /** Tujuan "Profil Saya"; tanpa ini item Profil tidak tampil. */
  profileHref?: string;
  collapsed?: boolean;
  /** Item menu tambahan (mis. Notifikasi) di atas Keluar. */
  extraItems?: ReactNode;
  onNavigate?: () => void;
};

const itemClass = "flex h-11 w-full items-center gap-3 rounded-sm px-3 text-left text-label-lg text-ink-900 no-underline hover:bg-ink-50 hover:no-underline focus-visible:bg-ink-50";

export function UserMenu({ user, profileHref, collapsed, extraItems, onNavigate }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const firstItem = rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function onMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[next]?.focus();
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await api.post("/auth/logout", undefined, { redirectOnUnauthenticated: false });
    } catch {
      // Sesi sudah tidak berlaku atau jaringan gagal: lanjut ke halaman masuk.
    }
    window.location.assign("/login");
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={onMenuKeyDown}>
      {open ? (
        <div id={menuId} role="menu" aria-label="Menu akun" className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-md bg-white p-1.5 text-ink-900 shadow-3">
          <div className="border-b border-ink-100 px-3 pt-1.5 pb-2.5">
            <p className="truncate text-label-lg">{user.name}</p>
            <p className="text-caption">{user.roleLabel}</p>
          </div>
          <div className="pt-1.5">
            {profileHref ? (
              <Link
                role="menuitem"
                href={profileHref as Route}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={itemClass}
              >
                <UserIcon size={18} /> Profil Saya
              </Link>
            ) : null}
            {extraItems}
            <button role="menuitem" type="button" onClick={logout} disabled={busy} className={cn(itemClass, "text-danger-600 disabled:opacity-45")}>
              <LogoutIcon size={18} /> {busy ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={collapsed ? `Menu akun ${user.name}` : undefined}
        title={collapsed ? `${user.name} (${user.roleLabel})` : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex min-h-12 w-full items-center gap-3 rounded-sm p-1.5 text-left transition-colors hover:bg-white/10", collapsed && "justify-center")}
      >
        <Avatar name={user.name} imageUrl={user.avatarUrl} size={36} />
        <span className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
          <span className="block truncate text-label-lg text-white">{user.name}</span>
          <span className="block truncate text-caption text-white/60">{user.roleLabel}</span>
        </span>
        {collapsed ? null : <ChevronUpIcon size={16} className={cn("flex-none text-white/60 transition-transform", !open && "rotate-180")} />}
      </button>
    </div>
  );
}
