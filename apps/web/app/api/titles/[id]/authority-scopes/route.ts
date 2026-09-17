// app/api/titles/[id]/authority-scopes/route.ts
// ADD-NEW — STEP11-B8 F11-B8-001: "Title Authority / Scope management ...
// no exact current dedicated endpoint is identified", TAPI tabel
// title_authority_scopes + RLS title_authority_scopes_select_public/_manage
// sudah lengkap sejak migration 0026, dan award_instances TIDAK BISA
// dibuat sama sekali tanpa baris aktif di sini (trigger
// enforce_award_requires_authority_scope) — jadi endpoint ini WAJIB ada
// supaya POST /awards bisa berfungsi lewat REST API sama sekali.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createTitleAuthorityScopeSchema } from "@/lib/validation/titles";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_authority_scopes")
    .select("*")
    .eq("title_definition_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createTitleAuthorityScopeSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("title_authority_scopes")
    .insert({ ...body, title_definition_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
