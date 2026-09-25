"use client";

// components/shell/AppShell.tsx — kerangka aplikasi per persona (Agent, Admin, Partner, Instructor): rel navigasi kiri di layar lebar (lg ke atas, dapat DISEMBUNYIKAN
// dan DITAMPILKAN — tidak terkunci) dan laci (drawer) dari kiri di layar sempit. Isi menu (`items`) diberikan tiap grup route; kontrak resmi jumlah dan urutan menu
// ada di STEP13-E §4 (Agent 8 tujuan, Admin capability-driven, Partner 7, Instructor 6). Otorisasi TETAP di API/RLS: menu hanya menyembunyikan, bukan mengamankan.
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string; icon?: ReactNode; badge?: number };
type Tone = "blue" | "ink";

type AppShellProps = {
  items: NavItem[];
  /** Nama layar/persona di topbar mobile dan judul rel, mis. "Agent" atau "Admin". */
  title: string;
  /** blue = Agent/Partner/Instructor, ink = Admin (sama dengan wireframe). */
  tone?: Tone;
  /** Slot bawah rel/laci (profil pengguna). */
  footer?: ReactNode;
  children: ReactNode;
};

const toneBg: Record<Tone, string> = { blue: "bg-blue-900", ink: "bg-ink-900" };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ items, collapsed, onNavigate }: { items: NavItem[]; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href as Route}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-sm px-4 whitespace-nowrap text-white/75 no-underline transition-colors hover:bg-white/8 hover:text-white hover:no-underline",
                active && "bg-white/14 text-white",
              )}
            >
              <span className="flex-none">{item.icon}</span>
              <span className={cn("text-label-lg", collapsed && "sr-only")}>{item.label}</span>
              {item.badge && !collapsed ? (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[12px] font-extrabold text-ink-900">{item.badge}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({ items, title, tone = "blue", footer, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (drawerOpen && !el.open) el.showModal();
    if (!drawerOpen && el.open) el.close();
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* Rel navigasi (layar lebar) */}
      <aside
        aria-label={`Navigasi ${title}`}
        className={cn("sticky top-0 hidden h-dvh flex-none flex-col transition-[width] duration-200 lg:flex", toneBg[tone], collapsed ? "w-19" : "w-60")}
      >
        <div className="flex h-19 flex-none items-center justify-between border-b border-white/10 px-4 text-white">
          <span className={cn("text-title-md", collapsed && "sr-only")}>RumahAgen · {title}</span>
          <IconButton
            label={collapsed ? "Tampilkan navigasi" : "Sembunyikan navigasi"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className="text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
          </IconButton>
        </div>
        <nav className="scroll-thin flex-1">
          <NavList items={items} collapsed={collapsed} />
        </nav>
        {footer ? <div className="flex-none border-t border-white/12 p-3 text-white">{footer}</div> : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (layar sempit) */}
        <header className={cn("sticky top-0 z-20 flex h-16 flex-none items-center gap-2 px-2 text-white lg:hidden", toneBg[tone])}>
          <IconButton label="Buka navigasi" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)} className="text-white hover:bg-white/10">
            <MenuIcon />
          </IconButton>
          <span className="text-title-md">{title}</span>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Laci navigasi (layar sempit) */}
      <dialog
        ref={drawerRef}
        aria-label={`Navigasi ${title}`}
        onClose={() => setDrawerOpen(false)}
        onClick={(e) => {
          if (e.target === drawerRef.current) setDrawerOpen(false);
        }}
        className={cn("m-0 h-dvh max-h-dvh w-72 max-w-[85vw] p-0 text-white shadow-3 backdrop:bg-ink-900/50 lg:hidden", toneBg[tone])}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-none items-center justify-between border-b border-white/10 px-4">
            <span className="text-title-md">RumahAgen · {title}</span>
            <IconButton label="Tutup navigasi" onClick={() => setDrawerOpen(false)} className="text-white hover:bg-white/10">
              <CloseIcon />
            </IconButton>
          </div>
          <nav className="scroll-thin flex-1">
            <NavList items={items} onNavigate={() => setDrawerOpen(false)} />
          </nav>
          {footer ? <div className="flex-none border-t border-white/12 p-3">{footer}</div> : null}
        </div>
      </dialog>
    </div>
  );
}
