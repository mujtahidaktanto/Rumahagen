// app/api/admin/agents/[id]/ktp/reset/route.ts
// POST /admin/agents/{id}/ktp/reset { reason } — staf mencabut verifikasi KTP (mis. dugaan KTP palsu): status kembali deferred, data KTP dihapus, foto dihapus
// dari storage, tercatat di audit log (migration 0149, admin_reset_ktp). Verifikasi otomatis tanpa tinjauan, sehingga pencabutan ini adalah kendali penyalahgunaan.

import { withApiHandler } from "@/lib/api/handler";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { resetKtpSchema } from "@/lib/validation/agent-ktp";
import { removeKtpObject } from "@/lib/storage/agent-ktp";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, resetKtpSchema);
  const supabase = await createClient();
  const { data: path, error } = await supabase.rpc("admin_reset_ktp", { p_user_id: ctx.params.id, p_reason: body.reason });
  if (error) {
    throwIntegrityError(error);
  }
  await removeKtpObject(typeof path === "string" ? path : null);
  return { data: { user_id: ctx.params.id, status: "deferred" } };
});
