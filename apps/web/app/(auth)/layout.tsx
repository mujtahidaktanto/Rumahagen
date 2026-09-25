import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

// Kerangka halaman autentikasi (M01): kartu di tengah dengan logo. Layar Register/OTP/Recovery memakai kerangka yang sama (Fase 2).
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo height={40} />
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2 sm:p-8">{children}</div>
    </main>
  );
}
