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
// DELETE: alur self-service DUA LANGKAH yang dikunci Core (Close lalu
// Confirm, PRE-00-N §6/B6 §12) direalisasikan sebagai DUA PANGGILAN
// berurutan ke endpoint locked yang SAMA -- panggilan pertama saat
// status='active' memindahkan ke 'closing' ("Close"), panggilan kedua saat
// status='closing' memindahkan ke 'closed' ("Confirm"). OTP-gated
// confirmation yang disebut QIR/Business Rules TIDAK dievidensi punya
// route API v2.1 apa pun ("exact current API v2.1 closure-confirm/OTP
// route is not evidenced", B6 §12) -- jadi TIDAK dibangun di sini,
// konsisten CONTROLLED ROUTE GAP yang didokumentasikan B6 sendiri.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

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
  if (org.created_by !== ctx.userId) {
    const { data: isSuperadmin, error: saErr } = await supabase.rpc("is_superadmin");
    if (saErr) throw saErr;
    if (!isSuperadmin) {
      const { data: roleCode, error: roleErr } = await supabase.rpc("current_role_code");
      if (roleErr) throw roleErr;
      if (roleCode !== "admin") {
        throw new ApiError("FORBIDDEN", "Hanya pembuat organisasi (leader) atau Superadmin/Admin yang bisa menutup organisasi ini.");
      }
    }
  }

  let nextStatus: string;
  if (org.status === "active") {
    nextStatus = "closing";
  } else if (org.status === "closing") {
    nextStatus = "closed";
  } else if (org.status === "closed") {
    throw new ApiError("CONFLICT", "Organisasi sudah closed -- status ini final, tidak bisa diubah lagi.");
  } else {
    throw new ApiError("CONFLICT", `Organisasi berstatus '${org.status}' -- penutupan hanya berlaku dari 'active' (Close) atau 'closing' (Confirm).`);
  }

  const { data, error } = await supabase
    .from("organizations")
    .update({ status: nextStatus })
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
