// app/api/developer-projects/[id]/claims/route.ts
// GET daftar klaim untuk satu project (dipakai Developer Partner untuk
// review, atau staf). Otorisasi lewat RLS agent_project_claims_select (0035)
// — Developer Partner pemilik project lihat semua klaim project miliknya,
// Agent hanya lihat klaim miliknya sendiri (baris lain otomatis tersaring RLS).

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_project_claims")
    .select("*")
    .eq("project_id", ctx.params.id)
    .order("claimed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
