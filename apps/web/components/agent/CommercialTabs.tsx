// components/agent/CommercialTabs.tsx — pengalih tiga layar Komersial Agent (Katalog, Langganan Saya, Pesanan & Kuota Saya). Tautan biasa (server-render); `active` menandai layar yang sedang dibuka.
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "katalog", href: "/agent/komersial", label: "Katalog Add-on" },
  { key: "langganan", href: "/agent/komersial/langganan", label: "Langganan Saya" },
  { key: "pesanan", href: "/agent/komersial/pesanan", label: "Pesanan & Kuota Saya" },
] as const;

export type CommercialTab = (typeof TABS)[number]["key"];

export function CommercialTabs({ active }: { active: CommercialTab }) {
  return (
    <nav aria-label="Komersial" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href as Route}
          aria-current={t.key === active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 flex-none items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
            t.key === active ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
