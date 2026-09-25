// app/api/certificates/verify/[code]/route.ts
// GET /certificates/verify/{kode} — verifikasi sertifikat PUBLIK (tanpa login), dipakai QR di sertifikat (migration 0150). Hanya mengembalikan data yang
// aman ditampilkan: nomor, status, nama pemegang, judul kursus, tanggal terbit, tanggal cabut, jenis penyelenggara. Tidak ada email, ID, atau data pribadi
// lain. Kode dinormalkan (huruf besar) di database; bentuk kode salah atau tidak ditemukan -> 404 yang sama (tidak membocorkan bentuk kode).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { certificateCodeSchema } from "@/lib/validation/certificates";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const parsed = certificateCodeSchema.safeParse(ctx.params.code);
  if (!parsed.success) {
    throw new ApiError("NOT_FOUND", "Sertifikat tidak ditemukan.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", { p_code: parsed.data });
  if (error) {
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new ApiError("NOT_FOUND", "Sertifikat tidak ditemukan.");
  }
  return {
    data: {
      valid: row.status === "issued",
      status: row.status,
      certificate_number: row.certificate_number,
      holder_name: row.holder_name,
      course_title: row.course_title,
      issued_at: row.issued_at,
      revoked_at: row.revoked_at,
      organizer_type: row.organizer_type,
    },
  };
});
