// app/verifikasi/page.tsx
// Halaman awal verifikasi sertifikat: input kode manual. Submit (GET ?kode=) dialihkan ke /verifikasi/{kode}. Kode yang bentuknya salah tetap dialihkan
// sehingga hasilnya sama dengan kode tak ditemukan.

import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { VerifyShell, VerifyForm, cardStyle } from "./ui";

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat | RumahAgen",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ kode?: string | string[] }> };

export default async function VerifyIndexPage({ searchParams }: Props) {
  const { kode } = await searchParams;
  const value = (Array.isArray(kode) ? kode[0] : kode)?.trim();
  if (value) {
    redirect(`/verifikasi/${encodeURIComponent(value.toUpperCase())}` as Route);
  }
  return (
    <VerifyShell>
      <div style={cardStyle}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Periksa keaslian sertifikat</h1>
        <p style={{ color: "#3C4858", marginBottom: 0 }}>
          Masukkan kode verifikasi yang tercetak di bawah QR pada sertifikat, atau pindai QR-nya untuk langsung membuka hasilnya.
        </p>
      </div>
      <VerifyForm />
    </VerifyShell>
  );
}
