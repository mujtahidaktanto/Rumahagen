// components/ui/Badge.tsx — lencana status (setara .ra-badge). HANYA lima nada dari katalog desain; jangan menambah nada baru.
// Pemetaan status entitas -> nada (mis. listing published = success) dibuat per modul dan HARUS sama persis dengan CHECK constraint tabelnya.
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "warning" | "success" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-ink-500",
  warning: "bg-warning-100 text-warning-600",
  success: "bg-success-100 text-success-600",
  danger: "bg-danger-100 text-danger-600",
  info: "bg-info-100 text-info-600",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; dot?: boolean };

export function Badge({ tone = "neutral", dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill py-1 pr-2.5 pl-2 text-[12px] leading-4 font-bold", tones[tone], className)} {...props}>
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
