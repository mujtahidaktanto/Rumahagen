// app/verifikasi/page.tsx — halaman awal verifikasi sertifikat (M04, wireframe M04-Verifikasi-Sertifikat): kolom kode + "Cara kerja verifikasi". Submit (GET ?kode=) dialihkan ke
// /verifikasi/{kode}; kode yang bentuknya salah tetap dialihkan sehingga hasilnya sama dengan kode tak ditemukan. Tidak diindeks.
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { HowItWorks, VerifyForm, VerifyPage } from "./ui";

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat | RumahAgen",
  description: "Periksa keaslian sertifikat RumahAgen dengan kode verifikasi di bawah QR, tanpa perlu login.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ kode?: string | string[] }> };

export default async function VerifyIndexPage({ searchParams }: Props) {
  const { kode } = await searchParams;
  const value = (Array.isArray(kode) ? kode[0] : kode)?.trim();
  if (value) {
    redirect(`/verifikasi/${encodeURIComponent(value.toUpperCase().slice(0, 40))}` as Route);
  }
  return (
    <VerifyPage>
      <VerifyForm />
      <HowItWorks />
    </VerifyPage>
  );
}
