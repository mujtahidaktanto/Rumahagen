"use client";

// components/shell/TopbarSearch.tsx — kolom "Cari…" di topbar desktop (wireframe M08 Dashboard): pilih cakupan (Listing, Agen, Event) lalu ketik kata kunci; Enter membuka halaman pencarian publik
// yang sesuai dengan ?q= (halaman itu sudah mendukung kata kunci). Kolom kosong tidak mengirim apa pun.
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { SEARCH_SCOPES, searchHref, type SearchScope } from "@/lib/agent/search-scope";

export function TopbarSearch() {
  const router = useRouter();
  const [scope, setScope] = useState<SearchScope>("listing");
  const [q, setQ] = useState("");
  const current = SEARCH_SCOPES.find((s) => s.value === scope)!;

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const href = searchHref(scope, q);
        if (href) router.push(href as Route);
      }}
      className="flex h-11 w-full max-w-[420px] items-center rounded-md border-[1.5px] border-ink-100 bg-white focus-within:border-blue-600"
    >
      <label htmlFor="topbar-scope" className="sr-only">
        Cakupan pencarian
      </label>
      <select
        id="topbar-scope"
        value={scope}
        onChange={(e) => setScope(e.target.value as SearchScope)}
        className="h-full flex-none rounded-l-md border-r border-ink-100 bg-ink-50 pr-1 pl-3 text-label-lg text-ink-700 outline-none"
      >
        {SEARCH_SCOPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <label htmlFor="topbar-q" className="sr-only">
        Kata kunci pencarian
      </label>
      <input
        id="topbar-q"
        type="search"
        value={q}
        maxLength={100}
        onChange={(e) => setQ(e.target.value)}
        placeholder={current.placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-body-md outline-none placeholder:text-ink-300"
      />
      <button type="submit" aria-label="Cari" className="flex h-full w-11 flex-none items-center justify-center text-ink-500 hover:text-blue-600">
        <SearchIcon size={18} />
      </button>
    </form>
  );
}
