// components/public/DiscoveryTabs.tsx — tab jenis pencarian di atas halaman Discovery (wireframe M11): Properti, Agen, Organisasi, Developer, Event. Tab aktif = halaman ini; sisanya tautan.
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "listing", href: "/listing", label: "Properti" },
  { key: "agen", href: "/agen", label: "Agen" },
  { key: "organisasi", href: "/organisasi", label: "Organisasi" },
  { key: "developer", href: "/developer", label: "Developer" },
  { key: "event", href: "/event", label: "Event" },
] as const;

export function DiscoveryTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Jenis pencarian" className="mb-3.5 flex flex-wrap gap-2">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href as Route}
          aria-current={t.key === active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
            t.key === active ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
