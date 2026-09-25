// components/ui/Card.tsx — permukaan kartu (setara .ra-card dan .ra-card-elevated).
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & { elevated?: boolean };

export function Card({ elevated = false, className, ...props }: CardProps) {
  return <div className={cn("rounded-md bg-white", elevated ? "shadow-2" : "border border-ink-100", className)} {...props} />;
}
