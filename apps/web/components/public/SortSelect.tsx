"use client";

// components/public/SortSelect.tsx — pilihan urutan hasil (wireframe "Terbaru ▾"): mengganti ?urut= pada URL sekarang dan kembali ke tampilan awal daftar (tanpa ?tampil).
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { SORTS, SORT_LABEL, type Sort } from "@/lib/public/listing-params";

export function SortSelect({ value }: { value: Sort }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-700">
      <span className="sr-only sm:not-sr-only">Urutkan</span>
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(window.location.search);
          p.delete("tampil");
          if (e.target.value === "terbaru") p.delete("urut");
          else p.set("urut", e.target.value);
          const qs = p.toString();
          router.push((qs ? `/listing?${qs}` : "/listing") as Route);
        }}
        className="h-10 rounded-sm border-[1.5px] border-ink-100 bg-white px-3 text-[13px] font-semibold text-ink-700"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
