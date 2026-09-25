// lib/certificates/response.ts
// Respons untuk route PDF sertifikat (bukan JSON REST biasa, jadi tidak dibungkus withApiHandler; pola sama seperti claims/[id]/approval-pdf).

import { NextResponse } from "next/server";
import type { CertificateForPdf } from "@/lib/certificates/pdf";

export function certificateJsonError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Ubah galat Postgres dari fungsi sertifikat menjadi respons JSON (23514 -> 409, 42501 -> 403). */
export function certificateDbError(error: { code?: string; message?: string }): NextResponse {
  const message = (error.message ?? "").replace(/^[a-z_]+: /, "");
  if (error.code === "23514") return certificateJsonError(409, "CONFLICT", message);
  if (error.code === "42501") return certificateJsonError(403, "FORBIDDEN", message || "Anda tidak punya akses.");
  return certificateJsonError(500, "INTERNAL_ERROR", "Terjadi kesalahan pada server.");
}

export function certificatePdfResponse(bytes: Uint8Array, cert: Pick<CertificateForPdf, "certificate_number">, download: boolean): NextResponse {
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="sertifikat-${cert.certificate_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
