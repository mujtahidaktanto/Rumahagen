// app/api/admin/permissions/matrix/agent/route.ts
// GET/PUT /admin/permissions/matrix/agent — API-145/API-147 (M10,
// STEP11-A). Lapisan Permission Preset (`permission_presets` +
// `permission_preset_items`, migration 0004).
//
// KOREKSI (2026-09-25, ditemukan lewat pertanyaan user atas wireframe):
// nama path ("agent") berasal dari saat trigger enforce_preset_target_
// role_is_agent (0004) SALAH memaksa SEMUA preset ke role Agent, untuk
// SIAPA PUN termasuk Superadmin. Migration 0102 memperbaiki trigger itu
// persis sesuai STEP12-B PP-002/PP-003 ("Superadmin governance remains"
// untuk preset role lain, "Full preset governance" untuk preset target
// Superadmin) — TAPI endpoint HTTP ini sebelumnya tidak pernah diperbarui
// mengikutinya, tetap hardcode `getAgentRoleId()` untuk semua caller.
// Sekarang: `target_role_id` opsional di query (GET) dan body (PUT) —
// default Agent kalau tidak diisi (perilaku lama, satu-satunya yang bisa
// dipakai Manager), override ke role lain HANYA benar-benar berlaku kalau
// caller Superadmin — trigger 0004/0102 yang menegakkan itu (RAISE
// EXCEPTION untuk Manager yang mencoba role lain), tidak diduplikasi di
// sini (R-02).
//
// Otorisasi lewat RLS (R-02): SELECT — permission_presets_select_view
// (Superadmin/Admin/Manager, 0103, menutup gap "Admin hanya view" yang
// sebelumnya tidak terpenuhi RLS) — TIDAK dibatasi ke baris Agent-saja,
// jadi GET dengan target_role_id lain SAH untuk dilihat Admin/Manager
// juga (view-only), cuma WRITE-nya yang digerbangi trigger ke Superadmin.
// WRITE — permission_presets_manage (Superadmin ALL + Manager, 0007) —
// Admin TIDAK lolos WITH CHECK PUT ini, hanya bisa GET, persis sesuai
// batas yang diminta ("Admin hanya view").
//
// PUT menerima `preset_id` opsional: diisi untuk edit preset yang sudah
// ada (replace nama + seluruh item), dikosongkan untuk membuat preset
// baru — menutup dua endpoint terpisah (Create/Edit) yang STEP12-B sebut
// sebagai kapabilitas dibutuhkan tapi tidak mengunci ID endpoint pasti,
// jadi digabung ke SATU PUT sesuai locked path yang benar-benar ada.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { agentPermissionPresetUpsertSchema, presetTargetRoleQuerySchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// UUID role 'agent' bukan data rahasia (dipakai di banyak tempat lain,
// mis. trigger 0096), tapi RLS roles_select (has_permission
// m10.role_catalogue.view) tidak lolos untuk Agent/Developer Partner --
// resolusi ID ini dipisah lewat admin client supaya kegagalan LIHAT
// katalog role TIDAK bocor jadi INTERNAL_ERROR yang membingungkan; RLS
// yang sesungguhnya menggerbangi tetap query permission_presets di bawah
// (lewat client bersesi biasa).
async function getAgentRoleId(): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("roles").select("id").eq("code", "agent").maybeSingle();
  if (error) throw error;
  if (!data) throw new ApiError("INTERNAL_ERROR", "Role agent tidak ditemukan.");
  return data.id;
}

export const GET = withApiHandler({}, async (ctx) => {
  const query = validateSearchParams(new URL(ctx.request.url).searchParams, presetTargetRoleQuerySchema);
  const supabase = await createClient();
  const targetRoleId = query.target_role_id ?? (await getAgentRoleId());

  const { data: presets, error } = await supabase
    .from("permission_presets")
    .select(
      "id, name, target_role_id, created_by, updated_by, created_at, updated_at, permission_preset_items(permission_id, granted_scope, permissions(action_code)), user_permission_presets(user_id, assigned_by, assigned_at)",
    )
    .eq("target_role_id", targetRoleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data: presets };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, agentPermissionPresetUpsertSchema);
  const supabase = await createClient();
  const agentRoleId = await getAgentRoleId();
  // Default Agent (satu-satunya yang bisa dipakai Manager) -- override ke
  // role lain hanya benar-benar tervalidasi oleh trigger 0004/0102 di
  // bawah (Manager yang mencoba role lain akan RAISE EXCEPTION di sana).
  const targetRoleId = body.target_role_id ?? agentRoleId;

  let presetId = body.preset_id;

  if (presetId) {
    const { data: updated, error: updateErr } = await supabase
      .from("permission_presets")
      .update({ name: body.name, updated_by: ctx.userId, updated_at: new Date().toISOString() })
      .eq("id", presetId)
      .eq("target_role_id", targetRoleId)
      .select("id")
      .maybeSingle();

    if (updateErr) throw updateErr;
    if (!updated) {
      throw new ApiError("NOT_FOUND", "Preset tidak ditemukan, target role tidak cocok, atau Anda tidak punya akses.");
    }

    const { error: deleteItemsErr } = await supabase.from("permission_preset_items").delete().eq("preset_id", presetId);
    if (deleteItemsErr) throw deleteItemsErr;
  } else {
    const { data: created, error: createErr } = await supabase
      .from("permission_presets")
      .insert({ name: body.name, target_role_id: targetRoleId, created_by: ctx.userId })
      .select("id")
      .single();

    if (createErr) {
      if (createErr.code === "42501") {
        throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk membuat preset.");
      }
      // Trigger enforce_preset_target_role_is_agent (0004/0102) menolak
      // lewat RAISE EXCEPTION polos kalau Manager mencoba target_role_id
      // selain Agent (hanya Superadmin/service-role yang boleh).
      if (createErr.message?.includes("permission_presets.target_role_id:")) {
        throw new ApiError("FORBIDDEN", createErr.message);
      }
      throw createErr;
    }
    presetId = created.id;
  }

  const itemRows = body.items.map((item) => ({
    preset_id: presetId,
    permission_id: item.permission_id,
    granted_scope: item.granted_scope,
  }));

  const { error: insertItemsErr } = await supabase.from("permission_preset_items").insert(itemRows);
  if (insertItemsErr) {
    // Trigger enforce_preset_item_within_role_baseline (0004) menolak
    // lewat RAISE EXCEPTION polos kalau permission di luar baseline Agent
    // atau scope melebihi baseline-nya.
    if (insertItemsErr.message?.includes("permission_preset_items:")) {
      throw new ApiError("CONFLICT", insertItemsErr.message);
    }
    throw insertItemsErr;
  }

  const { data: result, error: fetchErr } = await supabase
    .from("permission_presets")
    .select("id, name, created_by, updated_by, created_at, updated_at, permission_preset_items(permission_id, granted_scope)")
    .eq("id", presetId)
    .single();

  if (fetchErr) throw fetchErr;

  return { data: result, status: body.preset_id ? 200 : 201 };
});
