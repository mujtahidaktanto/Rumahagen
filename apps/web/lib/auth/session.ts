// lib/auth/session.ts — sesi dan penjaga peran untuk Server Component/layout. Otorisasi FINAL tetap di API dan RLS; penjaga ini hanya menentukan halaman apa yang
// dirender dan ke mana pengguna dialihkan (UI menyembunyikan, bukan mengamankan). Sesi disegarkan di middleware (lib/supabase/middleware.ts).
import { cache } from "react";
import { headers } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AREA_PATH, AREA_ROLES, homePathOf, isRoleCode, type Area, type RoleCode } from "./roles";

export interface SessionUser {
  id: string;
  email: string | null;
  role: RoleCode;
  /** users.status (active | suspended | ...). Hanya "active" yang boleh memakai area aplikasi. */
  status: string;
  /** Nama tampilan: agent_profiles.full_name bila ada, selain itu bagian depan email. */
  name: string;
  avatarUrl: string | null;
}

/** Pengguna yang login (terverifikasi ke server Supabase via getUser), atau null bila belum login / baris users tidak terbaca. Di-cache per permintaan (layout + halaman memakai satu hasil). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const authUser = auth.user;
  if (!authUser) return null;

  // Peran lewat RPC current_role_code() (SECURITY DEFINER; menjawab '' bila tak ada): tabel roles sendiri hanya terbaca pemegang izin m10.role_catalogue.view,
  // jadi menggabungkannya (roles(code)) dari sesi Agent menghasilkan null.
  const [{ data: row }, { data: roleCode }] = await Promise.all([
    supabase.from("users").select("status").eq("id", authUser.id).maybeSingle(),
    supabase.rpc("current_role_code"),
  ]);
  const role = isRoleCode(roleCode) ? roleCode : null;
  if (!row || !role) return null;

  const { data: profile } = await supabase.from("agent_profiles").select("full_name, avatar_url").eq("user_id", authUser.id).maybeSingle();
  const fallbackName = authUser.email ? authUser.email.split("@")[0]! : "Pengguna";

  return {
    id: authUser.id,
    email: authUser.email ?? null,
    role,
    status: row.status,
    name: profile?.full_name?.trim() || fallbackName,
    avatarUrl: profile?.avatar_url ?? null,
  };
});

/**
 * Penjaga layout area. Belum login -> /login?next=<jalur sekarang>; akun tidak aktif -> /login?alasan=dibatasi; peran salah area -> beranda area perannya
 * (bukan 403, agar keberadaan halaman staf tidak dibocorkan ke peran lain).
 */
export async function requireArea(area: Area): Promise<SessionUser> {
  const user = await getSessionUser();
  const h = await headers();
  const path = h.get("x-pathname") ?? AREA_PATH[area];
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}` as Route);
  if (user.status !== "active") redirect("/login?alasan=dibatasi" as Route);
  if (!AREA_ROLES[area].includes(user.role)) redirect(homePathOf(user.role) as Route);
  return user;
}
