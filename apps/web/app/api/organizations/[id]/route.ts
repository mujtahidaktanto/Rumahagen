// app/api/organizations/[id]/route.ts
// GET /organizations/{id} — API-157 (detail). DELETE /organizations/{id}
// — API-167 ("begin governed closure, not hard delete" -- STEP11-B6 §12).
//
// GET: RLS organizations_select_member (member/staf) OR
// organizations_select_active_public (0110, siapa pun untuk status
// 'active') menggerbangi BARIS mana yang terlihat -- kurasi KOLOM untuk
// non-member (address/contact_phone/social_media disembunyikan, "must not
// expose private Organization information", B6 §8/§10) dilakukan di sini,
// bukan di RLS.
//
// DELETE: langkah PERTAMA dari alur dua-langkah yang dikunci Core (Close
// lalu Confirm, PRE-00-N §6/B6 §12) -- memindahkan status='active' ke
// 'closing' ("Close"). Langkah KEDUA ("Confirm") TIDAK lagi lewat endpoint
// ini -- PRD terkunci (STEP13-A v3.7, bagian M12) eksplisit menyebut
// "Closure is irreversible after successful OTP gate and server-side state
// transition", jadi Confirm sekarang WAJIB lewat
// POST /organizations/{id}/close-otp (kirim OTP) lalu
// POST /organizations/{id}/close-otp/confirm (verifikasi OTP + eksekusi
// transisi 'closing' -> 'closed'). Ini menutup CONTROLLED ROUTE GAP yang
// tadinya didokumentasikan di sini -- OTP dikirim/diverifikasi lewat
// Supabase Auth signInWithOtp/verifyOtp (mekanisme email-OTP yang SUDAH
// ada, ADR-018 melarang provider/layanan baru), bukan sistem OTP baru.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { assertCanCloseOrganization } from "@/lib/organizations/authorize-close";

const PUBLIC_FIELDS = [
  "id",
  "organization_name",
  "slug",
  "organization_type",
  "logo_url",
  "banner_url",
  "description",
  "website",
  "status",
  "created_at",
] as const;

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("organizations").select("*").eq("id", ctx.params.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new ApiError("NOT_FOUND", "Organisasi tidak ditemukan atau Anda tidak punya akses.");
  }

  const { data: isMember, error: memberErr } = await supabase.rpc("is_org_member", { p_organization_id: ctx.params.id });
  if (memberErr) throw memberErr;

  if (isMember) {
    return { data };
  }

  const curated = Object.fromEntries(PUBLIC_FIELDS.map((k) => [k, (data as Record<string, unknown>)[k]]));
  return { data: curated };
});

export const DELETE = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data: org, error: findErr } = await supabase
    .from("organizations")
    .select("id, status, created_by")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!org) {
    throw new ApiError("NOT_FOUND", "Organisasi tidak ditemukan atau Anda tidak punya akses.");
  }

  // Dicek eksplisit (bukan cuma mengandalkan RLS organizations_manage)
  // supaya pemanggil TANPA hak (mis. Manager, yang RLS organizations_
  // select_active_public/0110 tetap mengizinkan MELIHAT baris ini) dapat
  // 403 yang jelas -- tanpa ini, UPDATE yang di-block RLS dan race
  // condition sungguhan sama-sama menghasilkan `data` null, tidak bisa
  // dibedakan.
  await assertCanCloseOrganization(supabase, org, ctx.userId);

  if (org.status === "closing") {
    throw new ApiError(
      "CONFLICT",
      "Organisasi sudah di tahap 'closing' -- selesaikan lewat POST /organizations/{id}/close-otp lalu /close-otp/confirm (OTP wajib untuk langkah Confirm).",
    );
  }
  if (org.status === "closed") {
    throw new ApiError("CONFLICT", "Organisasi sudah closed -- status ini final, tidak bisa diubah lagi.");
  }
  if (org.status !== "active") {
    throw new ApiError("CONFLICT", `Organisasi berstatus '${org.status}' -- penutupan (Close) hanya berlaku dari status 'active'.`);
  }

  const { data, error } = await supabase
    .from("organizations")
    .update({ status: "closing" })
    .eq("id", ctx.params.id)
    .eq("status", org.status)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("CONFLICT", "Status organisasi berubah sebelum diproses -- coba lagi.");
  }

  await supabase.rpc("log_audit_event", {
    p_action: "m12.organization.close",
    p_entity_type: "organizations",
    p_entity_id: data.id,
    p_organization_id: data.id,
    p_old_value: { status: org.status },
    p_new_value: { status: data.status },
  });

  return { data };
});
