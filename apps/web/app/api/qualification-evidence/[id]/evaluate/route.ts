// app/api/qualification-evidence/[id]/evaluate/route.ts
// ADD-NEW — realisasi HTTP dari fungsi evaluate_qualification() (migration
// 0027, separuh kedua pipeline D13-03). STEP11-B8 API-218 menulis path
// "POST /qualification-evaluations/{evaluation_id}/evaluate", TAPI fungsi
// SQL yang benar-benar ada (evaluate_qualification(p_evidence_id, ...))
// bertumpu pada EVIDENCE, bukan evaluation yang sudah ada — memanggil satu
// evidence menghasilkan satu evaluation BARU, bukan mengubah evaluation
// lama. Endpoint ini sengaja di-key oleh evidence_id (bukan evaluation_id)
// supaya sesuai kontrak fungsi SQL yang sudah fisik, bukan memaksakan path
// dokumen yang tidak cocok dengan realisasi sesungguhnya (pola sama seperti
// M13 ai-connections DELETE yang direalisasikan sebagai soft-disconnect).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { evaluateFromEvidenceSchema } from "@/lib/validation/qualification";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, evaluateFromEvidenceSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("evaluate_qualification", {
      p_evidence_id: ctx.params.id,
      p_evaluator_reference: body.evaluator_reference ?? null,
    })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("m15.qualification.evaluate")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    if (typeof error.message === "string" && error.message.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
