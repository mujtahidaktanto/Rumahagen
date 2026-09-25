// app/api/organizations/[id]/close-otp/confirm/route.ts
// Langkah "Confirm" -- terakhir dari alur Close-lalu-Confirm penutupan
// Organisasi. Menerima kode OTP yang dikirim oleh
// POST /organizations/{id}/close-otp, memverifikasinya lewat Supabase Auth
// verifyOtp (type:"email" -- tipe yang sama dipakai signInWithOtp
// passwordless-login sesuai dokumentasi @supabase/auth-js, BUKAN "signup"
// yang dipakai m01 registrasi), dan HANYA jika valid mengeksekusi transisi
// status 'closing' -> 'closed' (ireversibel per PRD terkunci STEP13-A v3.7
// M12: "irreversible after successful OTP gate and server-side state
// transition"). Verifikasi+transisi disatukan dalam satu request (bukan
// dua step server terpisah) supaya tidak ada celah antara "OTP valid" dan
// "status benar-benar berubah".
//
// Efek samping yang disengaja: verifyOtp lewat client cookie-bound
// (lib/supabase/server.ts) akan me-refresh sesi pemanggil ke token baru --
// user yang sama, tetap login, pola identik dengan
// app/api/auth/verify-otp/route.ts (m01) yang sudah menerima efek ini.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { confirmOrganizationCloseSchema } from "@/lib/validation/organizations";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";
import { assertCanCloseOrganization } from "@/lib/organizations/authorize-close";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, confirmOrganizationCloseSchema);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new ApiError("UNAUTHENTICATED", "Sesi tidak valid.");
  }

  const { data: org, error: findErr } = await supabase
    .from("organizations")
    .select("id, status, created_by")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!org) {
    throw new ApiError("NOT_FOUND", "Organisasi tidak ditemukan atau Anda tidak punya akses.");
  }

  await assertCanCloseOrganization(supabase, org, ctx.userId);

  if (org.status !== "closing") {
    throw new ApiError(
      "CONFLICT",
      `Organisasi berstatus '${org.status}' -- konfirmasi OTP hanya berlaku dari status 'closing'.`,
    );
  }

  const { error: otpError } = await supabase.auth.verifyOtp({
    email: user.email,
    token: body.token,
    type: "email",
  });
  if (otpError) mapAuthError(otpError);

  const { data, error } = await supabase
    .from("organizations")
    .update({ status: "closed" })
    .eq("id", ctx.params.id)
    .eq("status", "closing")
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("CONFLICT", "Status organisasi berubah sebelum diproses -- coba lagi.");
  }

  await logAuditEvent(ctx.userId, {
    p_action: "m12.organization.close_confirmed",
    p_entity_type: "organizations",
    p_entity_id: data.id,
    p_organization_id: data.id,
    p_old_value: { status: "closing" },
    p_new_value: { status: data.status },
  });

  return { data };
});
