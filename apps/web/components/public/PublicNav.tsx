"use client";

// components/public/PublicNav.tsx — navigasi header publik: baris tautan di layar lebar (xl), laci dari kiri di layar sempit. Tautan aktif = jalur cocok (beranda hanya "/").
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { activeHref } from "@/components/shell/nav-active";
import { PUBLIC_NAV } from "./public-nav";

export function PublicNav({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const current = activeHref(pathname, PUBLIC_NAV.map((l) => l.href));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <>
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-2 px-4 sm:px-6 xl:h-19 xl:gap-4 xl:px-10">
        <IconButton label="Buka menu" aria-expanded={open} onClick={() => setOpen(true)} className="-ml-2 xl:hidden">
          <MenuIcon />
        </IconButton>
        <Link href="/" aria-label="RumahAgen — beranda" className="flex-none">
          <Logo height={30} />
        </Link>
        <nav aria-label="Navigasi utama" className="hidden flex-1 items-center gap-1 xl:flex">
          {PUBLIC_NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={cn(
                "flex h-10 items-center rounded-sm px-2 text-[13.5px] font-semibold whitespace-nowrap text-ink-700 no-underline hover:bg-ink-50 hover:text-blue-600 hover:no-underline",
                l.href === current && "bg-blue-50 text-blue-600",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">{account}</div>
      </div>

      <dialog
        ref={ref}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-0 h-dvh max-h-dvh w-72 max-w-[85vw] bg-white p-0 shadow-3 backdrop:bg-ink-900/50 xl:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-none items-center justify-between border-b border-ink-100 px-4">
            <Logo height={28} />
            <IconButton label="Tutup menu" onClick={() => setOpen(false)} className="-mr-2">
              <CloseIcon />
            </IconButton>
          </div>
          <nav aria-label="Navigasi utama" className="scroll-thin flex-1 overflow-y-auto p-3">
            <ul className="flex flex-col gap-1">
              {PUBLIC_NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={l.href === current ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center rounded-sm px-4 text-label-lg text-ink-700 no-underline hover:bg-ink-50 hover:no-underline",
                      l.href === current && "bg-blue-50 text-blue-600",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
