// app/api/users/profile/route.ts
// API-012 PUT /users/profile — Permitted profile update (STEP11-B1).
// Upsert: kalau agent_profiles milik ctx.userId belum ada, INSERT (create-
// on-first-use, RLS agent_profiles_insert mengizinkan pemilik sendiri);
// kalau sudah ada, UPDATE. `public_slug` dibuat server-side dari full_name
// saat pertama kali dibuat (F11-B1-006: exact field contract untuk
// visibility/CTA tidak dievidence secara terpisah — field-field itu
// diekspos di sini sebagai bagian dari update profil umum, bukan route
// dedicated baru, sesuai instruksi "do not invent dedicated route").
// `total_listings_sold`/`total_listings_rented` TIDAK ADA di skema Zod —
// murni cache M03, tidak ada jalur tulis (lihat migration 0029).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { upsertAgentProfileSchema } from "@/lib/validation/agent-profiles";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const PUT = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const body = await validateJsonBody(ctx.request, upsertAgentProfileSchema);
  const supabase = await createClient();

  const { data: existing, error: findErr } = await supabase
    .from("agent_profiles")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (findErr) {
    throw findErr;
  }

  if (existing) {
    const { data, error } = await supabase
      .from("agent_profiles")
      .update(body)
      .eq("id", existing.id)
      .select()
      .maybeSingle();

    if (error) {
      // Aturan alamat profil (0157, SQLSTATE 23514) menjadi 409 berpesan bahasa pengguna; alamat direbut bersamaan (23505) -> 409.
      if (error.code === "23505") throw new ApiError("CONFLICT", "Alamat profil sudah dipakai. Pilih alamat lain.");
      throwIntegrityError(error);
    }
    return { data };
  }

  const baseSlug = slugify(body.full_name) || "agent";
  const publicSlug = `${baseSlug}-${ctx.userId.slice(0, 8)}`;

  // Profil baru: slug selalu dibuat server (public_slug dari klien diabaikan; alamat kustom hanya lewat perubahan profil yang sudah ada).
  const { data, error } = await supabase
    .from("agent_profiles")
    .insert({ ...body, user_id: ctx.userId, public_slug: publicSlug })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
