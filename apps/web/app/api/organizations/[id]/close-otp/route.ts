// app/api/organizations/[id]/close-otp/route.ts
// Langkah OTP dari alur Close-lalu-Confirm penutupan Organisasi (PRE-00-N
// §6/B6 §12, dan eksplisit di PRD terkunci STEP13-A v3.7 bagian M12:
// "Closure is irreversible after successful OTP gate and server-side state
// transition"). POST di sini MENGIRIM kode OTP ke email pemanggil sendiri
// (bukan email Organisasi/Lead lain) -- yang di-OTP-verifikasi adalah
// IDENTITAS AKTOR yang menjalankan aksi ireversibel ini, sama seperti
// pola m01 signup OTP. Dikirim lewat Supabase Auth signInWithOtp
// (shouldCreateUser:false -- tidak membuat user baru, memakai infrastruktur
// email-OTP yang SUDAH ada; ADR-018 melarang menambah provider/layanan
// pengirim email baru). Cooldown antar-request untuk email yang sama
// ditegakkan oleh Supabase Auth sendiri (R-02, pola sama dengan
// app/api/auth/resend-otp/route.ts -- tidak diduplikasi di sini).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/api/auth-error";
import { assertCanCloseOrganization } from "@/lib/organizations/authorize-close";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
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
      `Organisasi berstatus '${org.status}' -- OTP konfirmasi penutupan hanya berlaku setelah langkah Close (status 'closing'). Panggil DELETE /organizations/{id} dulu.`,
    );
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });
  if (error) mapAuthError(error);

  await supabase.rpc("log_audit_event", {
    p_action: "m12.organization.close_otp_requested",
    p_entity_type: "organizations",
    p_entity_id: org.id,
    p_organization_id: org.id,
    p_old_value: null,
    p_new_value: null,
  });

  return { data: { otp_sent: true } };
});
