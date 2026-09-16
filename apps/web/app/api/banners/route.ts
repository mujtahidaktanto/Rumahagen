// app/api/banners/route.ts
// API-135 GET /banners/promotions (dipetakan ke path "banners" mengikuti
// nama tabel `public_announcement_promotion` dan koreksi 0028 — "banners" di
// STEP11-A adalah istilah UI lama untuk resource M11 Announcement/Promotion
// yang sama). Sumber semantik: STEP11-A F11-A-017 "GET /banners/promotions →
// M11 discovery". SENGAJA filter `.eq("status","active")` eksplisit di sini
// (bukan hanya mengandalkan RLS) — supaya staf yang punya permission
// m11.announcement_promotion.publish (yang lewat RLS
// public_announcement_promotion_manage_m11 bisa lihat SEMUA status) tetap
// mendapat kontrak "discovery publik = hanya yang aktif" saat memanggil route
// ini, konsisten dengan makna endpoint discovery-nya sendiri.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .select("id, title, content, image_reference, cta_reference, canonical_url, priority, schedule_at, expires_at")
    .eq("status", "active")
    .order("priority", { ascending: false });

  if (error) {
    throw error;
  }

  // Jendela schedule_at/expires_at difilter di sini (bukan query PostgREST
  // berantai) supaya logikanya jelas dibaca — volume banner aktif kecil,
  // filter di memori tidak jadi masalah performa.
  const now = Date.now();
  const visible = (data ?? []).filter((row) => {
    const notYetScheduled = row.schedule_at ? new Date(row.schedule_at).getTime() > now : false;
    const alreadyExpired = row.expires_at ? new Date(row.expires_at).getTime() <= now : false;
    return !notYetScheduled && !alreadyExpired;
  });

  return { data: visible };
});
