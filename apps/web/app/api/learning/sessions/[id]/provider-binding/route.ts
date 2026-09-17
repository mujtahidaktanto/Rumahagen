// app/api/learning/sessions/[id]/provider-binding/route.ts
// API-098 GET (read metadata, tanpa secret — kolom provider_binding memang
// tidak menyimpan credential sama sekali, hanya metadata koneksi), API-099
// PUT (create/replace — satu binding aktif per session, upsert by session_id),
// API-100 DELETE (remove). Otorisasi lewat RLS
// session_provider_bindings_select/_manage (0021).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { providerBindingSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_provider_bindings")
    .select("*")
    .eq("session_id", ctx.params.id)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Provider binding untuk session ini tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, providerBindingSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_provider_bindings")
    .insert({ ...body, session_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_provider_bindings")
    .delete()
    .eq("session_id", ctx.params.id)
    .select();

  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    throw new ApiError("NOT_FOUND", "Provider binding untuk session ini tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { session_id: ctx.params.id, deleted: true } };
});
