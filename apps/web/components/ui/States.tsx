"use client";

// components/ui/States.tsx — keadaan kosong dan gagal (setara pola empty-big di wireframe). Setiap layar data wajib punya keduanya, selain keadaan memuat dan sukses.
import type { ReactNode } from "react";
import { AlertIcon, InboxIcon } from "./icons";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

type StateBoxProps = { icon: ReactNode; title: string; message?: string; action?: ReactNode; role?: "status" | "alert"; className?: string };

function StateBox({ icon, title, message, action, role, className }: StateBoxProps) {
  return (
    <div role={role} className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center text-ink-500", className)}>
      {icon}
      <p className="text-title-md text-ink-900">{title}</p>
      {message ? <p className="max-w-sm text-body-md">{message}</p> : null}
      {action}
    </div>
  );
}

export function EmptyState({ title, message, action, className }: { title: string; message?: string; action?: ReactNode; className?: string }) {
  return <StateBox role="status" icon={<span className="text-ink-300"><InboxIcon size={34} /></span>} title={title} message={message} action={action} className={className} />;
}

/** Keadaan gagal memuat. `onRetry` menampilkan tombol "Coba Lagi". */
export function ErrorState({ title = "Data gagal dimuat", message, onRetry, className }: { title?: string; message?: string; onRetry?: () => void; className?: string }) {
  return (
    <StateBox
      role="alert"
      icon={<span className="text-danger-600"><AlertIcon size={34} /></span>}
      title={title}
      message={message}
      action={onRetry ? <Button size="sm" onClick={onRetry}>Coba Lagi</Button> : undefined}
      className={className}
    />
  );
}
