// app/api/listings/[id]/views/route.ts
// ADD-NEW — listing_views (M03, migration 0047) RLS `listing_views_insert
// FOR INSERT WITH CHECK (true)` eksplisit dirancang untuk "page-view counter
// ... termasuk pengunjung anonim", tapi STEP11-B2 tidak mengevidence route
// dedicated untuk ini secara literal (tidak muncul di API-025-050). Tanpa
// endpoint ini, tabel yang RLS-nya sudah didesain publik-insert tidak akan
// pernah bisa ditulis lewat REST API sama sekali — pola sama seperti
// quizzes/{id}/take (M04) dan titles/{id}/authority-scopes (M15): dibangun
// karena keberadaan RLS itu sendiri membuktikan maksud desainnya, bukan
// mengarang kapabilitas baru.
//
// TIDAK memakai `.select()` setelah `.insert()` — listing_views_select
// (RLS SELECT) dibatasi pemilik listing/staf, BUKAN publik. Kalau
// pengunjung anonim insert lalu RETURNING dicoba, Postgres menolak karena
// baris yang baru dibuat tidak lolos SELECT policy si pemanggil (gotcha
// arsitektural yang sama persis dengan listing_photos/listing_leads yang
// ditemukan saat testing Fase 1 migration — didokumentasikan di
// supabase/migrations/README.md).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { error } = await supabase.from("listing_views").insert({ listing_id: ctx.params.id });

  if (error) {
    throw error;
  }

  return { data: { recorded: true }, status: 201 };
});
