// app/api/users/verification-documents/route.ts
// API-013 POST /users/verification-documents — Verification-document
// intake; NOT activation (STEP11-B1). SENGAJA hanya POST — F11-B1-002/003
// eksplisit: "Do not invent GET/PUT/DELETE routes. Carry as evidence gap."
// Agent submit dokumennya sendiri; review_status selalu 'pending' di
// server (trigger 0055 + 0049 sendiri yang menegakkan review_status hanya
// berubah lewat staf, bukan lewat body request ini).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { submitVerificationDocumentSchema } from "@/lib/validation/verification-documents";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengirim dokumen verifikasi.");
  }

  const body = await validateJsonBody(ctx.request, submitVerificationDocumentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_verification_documents")
    .insert({
      user_id: ctx.userId,
      doc_type: body.doc_type,
      file_url: body.file_url,
      encrypted: body.encrypted ?? true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
