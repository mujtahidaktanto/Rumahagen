"use client";

// components/auth/PasswordInput.tsx — kolom kata sandi dengan tombol tampilkan/sembunyikan (wireframe M01: ikon mata di dalam kolom, target sentuh 44px).
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={shown ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={shown}
        className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-full text-ink-500 hover:text-ink-900"
      >
        {shown ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  );
}
