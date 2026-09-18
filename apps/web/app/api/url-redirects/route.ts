// app/api/url-redirects/route.ts
// ADD-NEW — url_redirects (M11 Fase 1, migration 0051). Tidak ada literal
// endpoint di STEP11-B9 M11 (dicek langsung, "redirect" tidak disebut sama
// sekali di dokumen itu) — TAPI RLS url_redirects_select_public FOR SELECT
// USING (true) dan komentar migration sendiri eksplisit: "satu-satunya
// tujuan tabel ini adalah menjawab 'URL lama ini sekarang kemana' untuk
// SIAPA PUN". Tanpa GET ?old_path= di sini, tabel ini tidak bisa
// menjalankan satu-satunya fungsinya sama sekali lewat REST API.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createUrlRedirectSchema } from "@/lib/validation/url-redirects";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const oldPath = url.searchParams.get("old_path");

  const supabase = await createClient();

  if (oldPath) {
    const { data, error } = await supabase
      .from("url_redirects")
      .select("*")
      .eq("old_path", oldPath)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new ApiError("NOT_FOUND", "Tidak ada redirect untuk old_path ini.");
    }
    return { data };
  }

  const { data, error } = await supabase.from("url_redirects").select("*").order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createUrlRedirectSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("url_redirects")
    .insert({
      old_path: body.old_path,
      new_path: body.new_path,
      redirect_type: body.redirect_type ?? 301,
      reason: body.reason ?? null,
      entity_type: body.entity_type ?? null,
      entity_id: body.entity_id ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "old_path ini sudah punya redirect.");
    }
    throw error;
  }

  return { data, status: 201 };
});
