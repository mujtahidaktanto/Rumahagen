// app/api/admin/certificates/[id]/revoke/route.ts
// POST /admin/certificates/{id}/revoke { note? } — staf (m04.certificate.manage) mencabut sertifikat (migration 0150). Status menjadi `revoked`, verifikasi publik
// menampilkan status dicabut, dan PDF tidak bisa diunduh lagi. Catatan opsional (MVP). Tercatat di audit log (m04.certificate.revoke). Sertifikat yang sudah
// dicabut atau tidak ditemukan -> 409.

import { withApiHandler } from "@/lib/api/handler";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { revokeCertificateSchema } from "@/lib/validation/certificates";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, revokeCertificateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("revoke_certificate", { p_certificate_id: ctx.params.id, p_note: body.note ?? null });
  if (error) {
    throwIntegrityError(error);
  }

  return { data };
});
