// components/auth/StatusPanel.tsx — kepala kartu auth: lingkaran ikon + judul + keterangan (pola berulang di wireframe M01 OTP/Recovery).
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "blue" | "success" | "warning" | "danger";
const ring: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-600",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
};

export function StatusPanel({ tone = "blue", icon, title, children }: { tone?: Tone; icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className={cn("flex h-15 w-15 items-center justify-center rounded-full", ring[tone])}>{icon}</div>
      <h1 className="text-headline">{title}</h1>
      {children ? <p className="text-body-md text-ink-500">{children}</p> : null}
    </div>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
      {children}
    </div>
  );
}
