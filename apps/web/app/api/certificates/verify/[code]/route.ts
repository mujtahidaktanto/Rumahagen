// app/api/certificates/verify/[code]/route.ts
// GET /certificates/verify/{kode} — verifikasi sertifikat PUBLIK (tanpa login), dipakai QR di sertifikat (migration 0150). Hanya mengembalikan data yang
// aman ditampilkan: nomor, status, nama pemegang, judul kursus, tanggal terbit, tanggal cabut, jenis penyelenggara. Tidak ada email, ID, atau data pribadi
// lain. Kode dinormalkan (huruf besar) di database; bentuk kode salah atau tidak ditemukan -> 404 yang sama (tidak membocorkan bentuk kode).
// Logika bersama dengan halaman /verifikasi/{kode}: lib/certificates/verify.ts.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { verifyCertificateByCode } from "@/lib/certificates/verify";

export const GET = withApiHandler({}, async (ctx) => {
  const result = await verifyCertificateByCode(String(ctx.params.code ?? ""));
  if (!result) {
    throw new ApiError("NOT_FOUND", "Sertifikat tidak ditemukan.");
  }
  return { data: result };
});
