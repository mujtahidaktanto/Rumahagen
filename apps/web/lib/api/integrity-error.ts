// lib/api/integrity-error.ts
// Pelanggaran aturan integritas di database (CHECK/trigger, SQLSTATE 23514) memakai pesan berbahasa pengguna berawalan "tabel: ".
// Fungsi ini mengubahnya menjadi ApiError CONFLICT (409) dengan pesan yang sama tanpa awalan. Pelanggaran wewenang di trigger
// (SQLSTATE 42501, mis. transisi status hanya untuk staf) menjadi FORBIDDEN (403). Galat lain dilempar apa adanya.

import { ApiError } from "@/lib/api/errors";

export function throwIntegrityError(error: { code?: string; message?: string }): never {
  if (error.code === "23514" && error.message) {
    const message = error.message.replace(/^[a-z_]+: /, "");
    // Kuota penerbitan listing habis (0140): sertakan penanda supaya klien bisa menampilkan ajakan beli slot/Pro.
    if (/^kuota listing (pribadi|organisasi) habis/.test(message)) {
      throw new ApiError("CONFLICT", message, { reason: "listing_quota_exhausted" });
    }
    throw new ApiError("CONFLICT", message);
  }
  if (error.code === "42501" && error.message && /^[a-z_]+: /.test(error.message)) {
    throw new ApiError("FORBIDDEN", error.message.replace(/^[a-z_]+: /, ""));
  }
  throw error;
}
