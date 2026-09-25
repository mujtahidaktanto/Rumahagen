// components/ui/Table.tsx — tabel data ala wireframe: pembungkus kartu dengan gulir horizontal untuk layar sempit, kepala kolom kecil kapital, baris berhover.
// Di mobile, layar daftar sebaiknya memakai kartu per baris; gunakan tabel hanya untuk Desktop (lg ke atas) atau data yang memang tabular.
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="scroll-thin overflow-x-auto rounded-md border border-ink-100 bg-white">
      <table className={cn("w-full border-collapse text-left text-body-md", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export const THead = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-ink-50 last:border-b-0 hover:bg-ink-50", className)} {...props} />;
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn("border-b border-ink-100 px-3.5 py-2.5 text-label-md whitespace-nowrap text-ink-300 uppercase", className)} {...props} />;
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3.5 py-2.5 align-middle", className)} {...props} />;
}
