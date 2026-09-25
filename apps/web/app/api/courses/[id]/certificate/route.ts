// app/api/courses/[id]/certificate/route.ts
// GET /courses/{id}/certificate[?download=1] — Agent mengunduh sertifikat PDF kursus yang sudah ia selesaikan (migration 0150). Bila sertifikat belum ada
// (kursus selesai sebelum fitur ini, atau penerbitan otomatis dimatikan) fungsi ensure_my_certificate menerbitkannya saat itu juga (idempoten), sehingga
// Agent bisa mengunduh ulang kapan saja dari riwayat kursus. Kursus yang belum selesai -> 409. Sertifikat dicabut -> 409.
// Bukan endpoint JSON REST biasa (respons PDF), jadi tidak dibungkus withApiHandler.

import { certificateDbError, certificateJsonError, certificatePdfResponse } from "@/lib/certificates/response";
import { generateCertificatePdf, type CertificateForPdf } from "@/lib/certificates/pdf";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const { id } = await routeContext.params;
  const download = new URL(request.url).searchParams.get("download") === "1";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return certificateJsonError(401, "UNAUTHENTICATED", "Login diperlukan untuk mengunduh sertifikat.");
  }

  const { data, error } = await supabase.rpc("ensure_my_certificate", { p_course_id: id });
  if (error) {
    return certificateDbError(error);
  }
  const cert = data as (CertificateForPdf & { status: string }) | null;
  if (!cert) {
    return certificateJsonError(404, "NOT_FOUND", "Sertifikat tidak ditemukan.");
  }
  if (cert.status !== "issued") {
    return certificateJsonError(409, "CONFLICT", "Sertifikat ini telah dicabut.");
  }

  return certificatePdfResponse(await generateCertificatePdf(cert), cert, download);
}
