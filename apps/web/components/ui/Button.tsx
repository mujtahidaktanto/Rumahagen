// components/ui/Button.tsx — tombol dan tautan bertampilan tombol (setara .ra-btn di tokens.css). Tinggi 44px (md) / 36px (sm): target sentuh >=44px di mobile
// dipenuhi ukuran md; gunakan sm hanya di kontrol padat desktop.
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45";
const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-label-lg",
  sm: "h-9 px-4 text-[13px]",
};
const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-[1.5px] border-ink-100 bg-white text-blue-600 hover:border-blue-500",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-50",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Menampilkan keadaan memproses: tombol dinonaktifkan dan diberi aria-busy. */
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading = false, className, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {children}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

/** Tautan (next/link) yang tampil seperti tombol. */
export function LinkButton({ variant = "primary", size = "md", className, ...props }: LinkButtonProps) {
  // text-white pada tautan menimpa a { color } di globals.css lewat utilitas varian.
  return <Link className={cn(buttonClass(variant, size, className), variant === "primary" || variant === "danger" ? "hover:text-white" : "hover:no-underline")} {...props} />;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

/** Tombol ikon 44x44. `label` wajib: dipakai sebagai aria-label karena tombol tanpa teks. */
export function IconButton({ label, className, children, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-45", className)}
      {...props}
    >
      {children}
    </button>
  );
}
