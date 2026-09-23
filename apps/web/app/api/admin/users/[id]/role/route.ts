// app/api/admin/users/[id]/role/route.ts
// PUT /admin/users/{id}/role — API-148 (M10, STEP11-A). Satu-satunya
// jalur resmi mengganti role user selain SQL langsung. Superadmin-only —
// RLS users_update_admin (0104, ditambahkan justru karena endpoint ini
// tidak akan berfungsi tanpanya: users_update_self lama hanya mengizinkan
// `id = auth.uid()`, tidak pernah baris user LAIN). Trigger
// enforce_users_protected_columns (0100/0101) tetap jadi lapis kedua yang
// menegakkan hanya Superadmin yang boleh menyentuh role_id sama sekali.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateUserRoleSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateUserRoleSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({ role_id: body.role_id })
    .eq("id", ctx.params.id)
    .select("id, role_id, status")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("FORBIDDEN", "Anda tidak punya akses untuk mengubah role user ini, atau user tidak ditemukan.");
  }

  return { data };
});
