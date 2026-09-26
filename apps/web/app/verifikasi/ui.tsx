// app/verifikasi/ui.tsx — potongan tampilan bersama halaman verifikasi sertifikat (M04): kerangka halaman + jejak, formulir kode (GET biasa, tanpa JavaScript),
// dan "Cara kerja verifikasi". Memakai komponen dasar dan token desain.
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function VerifyPage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink-900">
          Verifikasi Sertifikat
        </span>
      </nav>
      <header className="flex flex-col gap-1.5 pt-6 pb-5">
        <h1 className="text-headline">Verifikasi Sertifikat</h1>
        <p className="text-body-lg text-ink-500">Periksa keaslian sertifikat RumahAgen tanpa perlu login.</p>
      </header>
      <div className="flex flex-col gap-6 pb-14">{children}</div>
    </div>
  );
}

// Formulir GET biasa: /verifikasi?kode=XXXX-XXXX-XXXX mengalihkan ke /verifikasi/{kode}.
export function VerifyForm({ label = "Periksa", defaultValue = "", showHint = true }: { label?: string; defaultValue?: string; showHint?: boolean }) {
  return (
    <form action="/verifikasi" method="get" className="flex flex-col gap-2 rounded-lg border border-ink-100 bg-white p-5">
      <label htmlFor="kode" className="text-label-lg">
        Kode verifikasi
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          id="kode"
          name="kode"
          defaultValue={defaultValue}
          placeholder="XXXX-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          required
          aria-describedby={showHint ? "kode-hint" : undefined}
          className="min-w-0 flex-1 font-mono uppercase"
        />
        <Button type="submit" className="sm:w-32">
          {label}
        </Button>
      </div>
      {showHint ? (
        <p id="kode-hint" className="text-caption">
          Kode terdiri dari 12 karakter angka dan huruf A–F, contoh 3A62-89F8-8F1C. Kode tercetak di bawah QR pada sertifikat. Memindai QR membuka halaman ini dengan kode terisi.
        </p>
      ) : null}
    </form>
  );
}

const STEPS = [
  "Pindai QR pada sertifikat, atau ketik kode 12 karakter di kolom atas.",
  "Kami mencocokkan kode dengan data resmi RumahAgen dan menampilkan status terkini.",
  "Yang tampil hanya nama, kursus, nomor, tanggal, dan status. Tidak ada data pribadi lain seperti email atau nomor telepon.",
];

export function HowItWorks() {
  return (
    <section aria-labelledby="cara-kerja">
      <h2 id="cara-kerja" className="mb-3 text-title-lg">
        Cara kerja verifikasi
      </h2>
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span aria-hidden="true" className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-100 text-[13px] font-bold text-blue-600">
              {i + 1}
            </span>
            <span className="pt-0.5 text-body-md text-ink-700">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
