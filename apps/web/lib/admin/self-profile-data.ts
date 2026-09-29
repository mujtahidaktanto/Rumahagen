// lib/admin/self-profile-data.ts — Profil Saya (Admin/Manager/Superadmin): akun users.* saja (staf tidak punya agent_profiles). Kolom sama seperti
// GET /users/me (API-011) — dibaca langsung di server, bukan API sendiri, mengikuti pola modul admin lain.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type SelfAccountInfo = { emailVerifiedAt: string | null; lastLoginAt: string | null; createdAt: string };

export async function getSelfAccountInfo(userId: string): Promise<Part<SelfAccountInfo>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("users").select("email_verified_at, last_login_at, created_at").eq("id", userId).maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true, data: { emailVerifiedAt: data.email_verified_at, lastLoginAt: data.last_login_at, createdAt: data.created_at } };
}
