"use client";

// components/auth/OtpInput.tsx — kode 6 digit dalam kotak terpisah (wireframe M01-OTP): pindah otomatis, Backspace mundur, tempel kode utuh, autofill "one-time-code".
import { useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

const LENGTH = 6;

export function OtpInput({ value, onChange, invalid, disabled }: { value: string; onChange: (v: string) => void; invalid?: boolean; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();

  function setAt(i: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;
    const next = (value.slice(0, i) + clean).slice(0, LENGTH);
    onChange(next + value.slice(next.length));
    focus(Math.min(next.length, LENGTH - 1));
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const clean = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!clean) return;
    onChange(clean);
    focus(Math.min(clean.length, LENGTH - 1));
  }

  return (
    <div role="group" aria-label="Kode verifikasi 6 digit" className="flex justify-center gap-2 sm:gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={LENGTH}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn(
            "h-14 w-11 rounded-sm border-[1.5px] text-center text-[22px] font-bold text-ink-900 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none sm:w-13",
            invalid ? "border-danger-600 bg-danger-100" : d ? "border-blue-500 bg-blue-50" : "border-ink-100 bg-white",
          )}
        />
      ))}
    </div>
  );
}
