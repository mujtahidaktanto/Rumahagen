// app/api/admin/users/[id]/permission-preset/route.ts
// PUT /admin/users/{id}/permission-preset — ADD-NEW. STEP12-B menyebut
// "Assign/Replace" sebagai kapabilitas preset yang dibutuhkan tapi tidak
// mengunci ID endpoint pastinya — ekstensi minimal dari
// PUT /admin/users/{id}/role yang SUDAH dikunci STEP11-A (pola path yang
// sama, "staf bertindak atas satu akun user"). Tanpa endpoint ini preset
// yang dibuat lewat /admin/permissions/matrix/agent tidak bisa dipakai
// siapa pun (STEP12-B lifecycle: CREATED -> ... -> ASSIGNED).
//
// `preset_id: null` melepas assignment (kembali ke Role Default Matrix,
// STEP12-B §3). Kecocokan role user vs target_role_id preset ditegakkan
// trigger enforce_preset_assignee_matches_target_role (0004) — tidak
// diduplikasi di sini. Otorisasi lewat RLS user_permission_presets_manage
// (Superadmin + Manager, 0007) dan user_permission_presets_select_view
// (+Admin, 0103) untuk GET.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { assignPermissionPresetSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_permission_presets")
    .select("*")
    .eq("user_id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return { data: data ?? null };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, assignPermissionPresetSchema);
  const supabase = await createClient();

  if (body.preset_id === null) {
    const { error } = await supabase.from("user_permission_presets").delete().eq("user_id", ctx.params.id);
    if (error) throw error;
    return { data: { user_id: ctx.params.id, preset_id: null } };
  }

  const { data, error } = await supabase
    .from("user_permission_presets")
    .upsert(
      { user_id: ctx.params.id, preset_id: body.preset_id, assigned_by: ctx.userId, assigned_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select()
    .maybeSingle();

  if (error) {
    // Trigger enforce_preset_assignee_matches_target_role (0004) menolak
    // lewat RAISE EXCEPTION polos kalau role user tidak cocok target_role_id
    // preset (STEP12-B B-002: preset tidak pernah mengubah role).
    if (error.message?.includes("user_permission_presets:")) {
      throw new ApiError("CONFLICT", error.message);
    }
    if (error.code === "42501") {
      throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk menugaskan preset ini.");
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk menugaskan preset ini.");
  }

  return { data };
});
