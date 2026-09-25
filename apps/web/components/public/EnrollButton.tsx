"use client";

// components/public/EnrollButton.tsx — tombol aksi pendaftaran di halaman publik Learning: "Mulai Belajar" (POST /api/courses/{id}/enroll) dan "Daftar Sesi Ini"
// (POST /api/learning/sessions/{id}/enrollments). Idempotency-Key dibuat sekali per klik pengguna; 409 (sudah terdaftar) diperlakukan sebagai berhasil; 401 -> ajakan masuk.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { api, ApiClientError } from "@/lib/api-client";

type Props = {
  /** Jalur API tanpa awalan /api, mis. "/courses/{id}/enroll". */
  endpoint: string;
  label: string;
  /** Pesan setelah berhasil (juga bila sudah terdaftar sebelumnya). */
  doneMessage: string;
  /** Sudah terdaftar sejak awal (dibaca server): tombol diganti pesan. */
  alreadyEnrolled?: boolean;
  body?: Record<string, unknown>;
};

export function EnrollButton({ endpoint, label, doneMessage, alreadyEnrolled = false, body }: Props) {
  const [state, setState] = useState<"idle" | "busy" | "done">(alreadyEnrolled ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setState("busy");
    setError(null);
    try {
      await api.post(endpoint, body ?? {}, { idempotency: true, redirectOnUnauthenticated: false });
      setState("done");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setState("done"); // sudah terdaftar
        return;
      }
      setState("idle");
      if (err instanceof ApiClientError) {
        if (err.code === "UNAUTHENTICATED") setError("Sesi Anda berakhir. Masuk lagi untuk melanjutkan.");
        else if (err.code === "FORBIDDEN") setError("Akun Anda belum dapat mendaftar. Hubungi tim RumahAgen bila ini keliru.");
        else if (err.code === "RATE_LIMITED") setError("Terlalu banyak percobaan. Coba lagi beberapa saat lagi.");
        else if (err.code === "NETWORK_ERROR") setError(err.message);
        else setError("Pendaftaran belum berhasil. Coba lagi beberapa saat lagi.");
      } else setError("Terjadi kesalahan tak terduga. Coba lagi.");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-md bg-success-100 p-3 text-body-md text-success-600">
        {doneMessage}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClick} loading={state === "busy"} className="h-12 w-full">
        {state === "busy" ? "Memproses…" : label}
      </Button>
      {error ? (
        <p role="alert" className="text-caption text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
