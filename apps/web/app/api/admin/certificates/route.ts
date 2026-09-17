// app/api/admin/certificates/route.ts
// ADD-NEW — POST issue certificate. Q-M04-C-06B: "Certificate view is not
// Credential administration" — issuance HANYA staf lewat
// m04.certificate.manage (0061), Agent TIDAK PERNAH diberi grant permission
// ini sama sekali (mencegah self-issue by construction, bukan RLS field
// per-kolom).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { issueCertificateSchema } from "@/lib/validation/certificates";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, issueCertificateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificates")
    .insert(body)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
