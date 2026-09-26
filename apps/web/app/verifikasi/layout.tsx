// app/verifikasi/layout.tsx — halaman verifikasi sertifikat memakai Global Public Shell yang sama dengan app/(publik) (header + footer). Berada di luar grup (publik) karena
// jalur /verifikasi sudah dicetak sebagai QR di PDF sertifikat dan foldernya lebih dulu ada.
import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
