"use client";

// components/public/HeroSearch.tsx — pencarian Hero (wireframe M11-Homepage): pilihan Properti/Agen/Developer/Event + kolom kata kunci; kirim ke halaman daftar terkait dengan ?q=.
import { useState } from "react";
import type { FormEvent } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "properti", label: "Properti", path: "/listing" },
  { key: "agen", label: "Agen", path: "/agen" },
  { key: "developer", label: "Developer", path: "/developer" },
  { key: "event", label: "Event", path: "/event" },
] as const;

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("properti");
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const path = TABS.find((t) => t.key === tab)!.path;
    const term = q.trim();
    router.push((term ? `${path}?q=${encodeURIComponent(term)}` : path) as Route);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex flex-col gap-3">
      <div role="group" aria-label="Cari di" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={t.key === tab}
            onClick={() => setTab(t.key)}
            className={cn(
              "h-10 rounded-pill border-[1.5px] px-4 text-[13px] font-bold",
              t.key === tab ? "border-blue-600 bg-blue-600 text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Kata kunci pencarian</span>
          <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari lokasi, nama proyek, tipe properti, atau kata kunci…"
            className="h-13 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
          />
        </label>
        <Button type="submit" className="h-13 px-7">
          Cari
        </Button>
      </div>
    </form>
  );
}
