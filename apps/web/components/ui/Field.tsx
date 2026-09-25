"use client";

// components/ui/Field.tsx — bidang formulir: label, kontrol, petunjuk, dan pesan galat yang terhubung ke kontrol lewat aria-describedby / aria-invalid.
import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-sm border-[1.5px] border-ink-100 bg-white px-3.5 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none aria-[invalid=true]:border-danger-600 disabled:bg-ink-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 py-3", className)} {...props} />;
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Fungsi render menerima props aksesibilitas yang harus dipasang ke kontrol (id, aria-*). */
  children: (a11y: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean }) => ReactNode;
  className?: string;
};

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId();
  const descId = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label-lg text-ink-900">
        {label}
        {required ? <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span> : null}
      </label>
      {children({ id, "aria-describedby": descId, "aria-invalid": error ? true : undefined, "aria-required": required || undefined })}
      {error ? (
        <p id={descId} role="alert" className="text-caption text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-caption">{hint}</p>
      ) : null}
    </div>
  );
}
