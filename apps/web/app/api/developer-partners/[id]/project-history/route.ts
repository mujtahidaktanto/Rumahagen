// app/api/developer-partners/[id]/project-history/route.ts
// GET (daftar riwayat perumahan milik satu developer, publik untuk developer aktif), POST (tambah entri). Otorisasi lewat RLS
// developer_project_history_select/_manage (migration 0172) -- pola sama seperti marketing-kit.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createDeveloperProjectHistorySchema } from "@/lib/validation/developer-partners";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_project_history")
    .select("*")
    .eq("developer_id", ctx.params.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { data: data ?? [] };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createDeveloperProjectHistorySchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("developer_project_history")
    .insert({ ...body, developer_id: ctx.params.id })
    .select()
    .single();

  if (error) throw error;
  return { data, status: 201 };
});
