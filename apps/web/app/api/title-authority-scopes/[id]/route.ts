// app/api/title-authority-scopes/[id]/route.ts
// ADD-NEW (pasangan dari titles/[id]/authority-scopes) — PUT update/
// deactivate, DELETE hapus binding. RLS title_authority_scopes_manage
// bertipe FOR ALL sehingga mencakup UPDATE dan DELETE sekaligus, tidak ada
// komentar "preserve audit trail" di 0026 untuk tabel ini (beda dari
// agent_ai_connections M13) — hard DELETE aman dipakai apa adanya.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateTitleAuthorityScopeSchema } from "@/lib/validation/titles";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateTitleAuthorityScopeSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("title_authority_scopes")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Title authority scope tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("title_authority_scopes")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Title authority scope tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
