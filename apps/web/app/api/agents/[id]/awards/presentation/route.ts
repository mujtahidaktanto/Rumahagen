// app/api/agents/[id]/awards/presentation/route.ts
// API-236 GET /agents/{agent_id}/awards/presentation — public/scoped: RLS
// title_presentations_select (0068) yang menggerbangi visibility per baris
// (bukan filter manual di sini) — pengunjung publik hanya lihat active=true,
// pemilik/staf lihat semua kalau kebetulan yang query adalah dirinya sendiri.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_presentations")
    .select("*")
    .eq("user_id", ctx.params.id)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return { data };
});
