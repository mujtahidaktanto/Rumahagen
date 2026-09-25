"use client";

// components/public/FilterToggle.tsx — panel filter yang dapat dilipat di layar sempit (tombol "Filter (n)"); di layar lebar (lg) selalu tampil. Isi (form) dirender server.
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FilterToggle({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="panel-filter"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-sm border-[1.5px] border-ink-100 bg-white px-4 text-label-lg text-ink-900 lg:hidden"
      >
        <span>Filter{count > 0 ? ` (${count})` : ""}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id="panel-filter" className={cn("mt-3 lg:mt-0 lg:block", open ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
}
