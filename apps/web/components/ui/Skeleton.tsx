// components/ui/Skeleton.tsx — placeholder pemuatan (setara .ra-skel). Bungkus area yang memuat dengan <LoadingRegion> agar pembaca layar diberi tahu.
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("skeleton h-4", className)} {...props} />;
}

/** Wadah keadaan memuat: role=status + aria-busy, dengan teks tersembunyi untuk pembaca layar. */
export function LoadingRegion({ label = "Memuat data…", className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
