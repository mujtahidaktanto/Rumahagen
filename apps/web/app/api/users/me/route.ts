// app/api/users/me/route.ts
// API-011 GET /users/me — Current account/profile read (STEP11-B1).
// Menggabungkan public.users (role/status, M01) + agent_profiles (M02,
// mungkin belum ada baris kalau user belum pernah isi profil) — satu
// endpoint "siapa saya" untuk client, bukan dua request terpisah.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }

  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, role_id, status, email_verified_at, last_login_at, created_at")
    .eq("id", ctx.userId)
    .maybeSingle();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new ApiError("NOT_FOUND", "Akun tidak ditemukan.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  return { data: { ...user, profile: profile ?? null } };
});
