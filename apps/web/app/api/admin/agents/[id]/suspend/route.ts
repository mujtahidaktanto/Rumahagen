// app/api/admin/agents/[id]/suspend/route.ts
// PUT /admin/agents/{id}/suspend — API-024 (M02, STEP11-A, PRESERVE --
// admin-surface gap #1, bagian ketiga). users.status='suspended' SUDAH
// fully-enforced sejak 0082 (has_permission() SELALU FALSE untuk akun
// suspended, apa pun rolenya) -- yang belum ada sebelum batch ini murni
// jalur HTTP untuk memicunya (Admin/Manager tidak bisa UPDATE baris user
// lain sama sekali, hanya Superadmin lewat users_update_admin/0104).
//
// Otorisasi Superadmin+Admin (BUKAN Manager, BUKAN permission code baru)
// mengikuti preseden organizations suspend (0087), bukan listing suspend
// (0086) -- konsisten dengan konvensi tabel users sendiri yang dari awal
// membedakan Superadmin+Admin (users_select_self_or_admin/0007,
// users_update_admin/0104) tanpa pernah melibatkan Manager. Tidak ada
// baris "Agent Suspend" di STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv --
// keputusan rekayasa didokumentasikan lengkap di migration 0108.
//
// Dicek eksplisit di kode (bukan cuma mengandalkan RLS 0108) supaya
// pesan error jelas (403 vs 404 vs 409) -- RLS+trigger 0108 tetap jadi
// penegak keras di lapisan DB kalau pengecekan ini entah bagaimana
// terlewati.
//
// SATU ARAH SAJA: hanya transisi active->suspended (persis kontrak Core
// yang dikunci, tidak ada endpoint "reactivate"/"unsuspend" dievidensi).
// Superadmin tetap bisa reaktivasi lewat PUT /admin/users/{id}/role atau
// akses langsung yang sudah ada -- tidak ada jalan buntu.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data: isSuperadmin, error: saErr } = await supabase.rpc("is_superadmin");
  if (saErr) throw saErr;
  if (!isSuperadmin) {
    const { data: roleCode, error: roleErr } = await supabase.rpc("current_role_code");
    if (roleErr) throw roleErr;
    if (roleCode !== "admin") {
      throw new ApiError("FORBIDDEN", "Hanya Superadmin/Admin yang bisa suspend Agent.");
    }
  }

  const { data: target, error: findErr } = await supabase
    .from("users")
    .select("id, status, roles(code)")
    .eq("id", ctx.params.id)
    .maybeSingle();
  if (findErr) throw findErr;
  const targetRoles = target?.roles as { code: string } | { code: string }[] | null | undefined;
  const targetRoleCode = Array.isArray(targetRoles) ? targetRoles[0]?.code : targetRoles?.code;
  if (!target || targetRoleCode !== "agent") {
    throw new ApiError("NOT_FOUND", "Agent tidak ditemukan.");
  }
  if (target.status !== "active") {
    throw new ApiError("CONFLICT", `Agent berstatus '${target.status}' -- suspend hanya berlaku untuk Agent yang sedang 'active'.`);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ status: "suspended" })
    .eq("id", ctx.params.id)
    .eq("status", "active")
    .select("id, role_id, status")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("CONFLICT", "Status Agent berubah sebelum suspend diproses -- coba lagi.");
  }

  await logAuditEvent(ctx.userId, {
    p_action: "m02.agent.suspend",
    p_entity_type: "users",
    p_entity_id: data.id,
    p_new_value: { status: data.status },
  });

  return { data };
});
