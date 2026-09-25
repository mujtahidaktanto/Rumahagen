// lib/certificates/verify.ts
// Verifikasi sertifikat PUBLIK (tanpa login), dipakai bersama oleh API GET /certificates/verify/{kode} dan halaman /verifikasi/{kode} (tujuan QR di PDF).
// Memanggil RPC verify_certificate (migration 0150) dengan klien anon/sesi biasa; RPC hanya mengembalikan data aman ditampilkan. Kode berbentuk salah dan
// kode tak ditemukan sama-sama menghasilkan null (tidak membocorkan bentuk kode).

import { certificateCodeSchema } from "@/lib/validation/certificates";
import { createClient } from "@/lib/supabase/server";

export type CertificateVerification = {
  valid: boolean;
  status: string;
  certificate_number: string;
  holder_name: string;
  course_title: string;
  issued_at: string;
  revoked_at: string | null;
  organizer_type: string | null;
};

export async function verifyCertificateByCode(rawCode: string): Promise<CertificateVerification | null> {
  const parsed = certificateCodeSchema.safeParse(rawCode);
  if (!parsed.success) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", { p_code: parsed.data });
  if (error) {
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return null;
  }
  return {
    valid: row.status === "issued",
    status: row.status,
    certificate_number: row.certificate_number,
    holder_name: row.holder_name,
    course_title: row.course_title,
    issued_at: row.issued_at,
    revoked_at: row.revoked_at,
    organizer_type: row.organizer_type,
  };
}
