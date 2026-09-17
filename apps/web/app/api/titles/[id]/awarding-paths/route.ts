// app/api/titles/[id]/awarding-paths/route.ts
// API-205 GET /titles/{title_id}/awarding-paths (list, scoped),
// API-206 POST /titles/{title_id}/awarding-paths (authorized authority).
// Otorisasi lewat RLS awarding_paths_manage (0064) —
// m15.awarding_path_rule.configure, Superadmin/Admin/Manager saja
// (config engine staff-only, bukan resource milik Agent).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAwardingPathSchema } from "@/lib/validation/awarding-paths";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awarding_paths")
    .select("*")
    .eq("title_definition_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAwardingPathSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("awarding_paths")
    .insert({ ...body, title_definition_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
