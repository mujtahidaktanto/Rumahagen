// app/api/certificates/[id]/pdf/route.ts
// GET /certificates/{id}/pdf[?download=1] — PDF sertifikat berdasarkan id sertifikat (migration 0150). Akses lewat RLS certificates_select: pemilik (Agent)
// atau staf (m04.certificate.manage). Sertifikat dicabut -> 409. Bukan endpoint JSON REST biasa, jadi tidak dibungkus withApiHandler.

import { certificateJsonError, certificatePdfResponse } from "@/lib/certificates/response";
import { generateCertificatePdf, type CertificateForPdf } from "@/lib/certificates/pdf";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const { id } = await routeContext.params;
  const download = new URL(request.url).searchParams.get("download") === "1";
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificates")
    .select("certificate_number, verification_code, issued_at, status, snapshot")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return certificateJsonError(500, "INTERNAL_ERROR", "Terjadi kesalahan pada server.");
  }
  if (!data) {
    return certificateJsonError(404, "NOT_FOUND", "Sertifikat tidak ditemukan atau Anda tidak punya akses.");
  }
  if (data.status !== "issued") {
    return certificateJsonError(409, "CONFLICT", "Sertifikat ini telah dicabut.");
  }

  return certificatePdfResponse(await generateCertificatePdf(data as unknown as CertificateForPdf), data, download);
}
