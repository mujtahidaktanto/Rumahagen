"use client";

// components/ui/Switch.tsx — saklar dua keadaan (setara .switch di wireframe): role=switch + aria-checked, area sentuh 44px. Label/keterangan ditulis pemanggil di sebelahnya
// (beri `aria-labelledby` atau `aria-label`).
import { cn } from "@/lib/cn";

type SwitchProps = { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean; "aria-label"?: string; "aria-labelledby"?: string; className?: string };

export function Switch({ checked, onChange, disabled, className, ...aria }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative flex h-11 w-14 flex-none cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60", className)}
      {...aria}
    >
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-blue-600" : "bg-ink-200")}>
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-1 transition-transform", checked && "translate-x-5")} />
      </span>
    </button>
  );
}
