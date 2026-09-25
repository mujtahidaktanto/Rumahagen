// app/api/admin/certificates/route.ts
// ADD-NEW — POST issue certificate. Q-M04-C-06B: "Certificate view is not
// Credential administration" — issuance HANYA staf lewat
// m04.certificate.manage (0061), Agent TIDAK PERNAH diberi grant permission
// ini sama sekali (mencegah self-issue by construction, bukan RLS field
// per-kolom).
//
// 0150: tabel certificates tidak bisa ditulis langsung lagi; penerbitan lewat fungsi admin_issue_certificate() yang menerbitkan hanya untuk Agent yang
// enrollment-nya sudah selesai, memberi nomor RA-{tahun}-{6 digit} + kode verifikasi, idempoten (satu sertifikat per Agent per kursus), dan tercatat di audit log.

import { withApiHandler } from "@/lib/api/handler";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { issueCertificateSchema } from "@/lib/validation/certificates";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, issueCertificateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_issue_certificate", { p_agent_id: body.agent_id, p_course_id: body.course_id });
  if (error) {
    throwIntegrityError(error);
  }

  return { data, status: 201 };
});
