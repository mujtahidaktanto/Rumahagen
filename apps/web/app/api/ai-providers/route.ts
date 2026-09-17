// app/api/ai-providers/route.ts
// GET /ai-providers (evidenced, STEP11-B10 §4 M13) — katalog provider AI
// untuk BYOK. POST (create) ADD-NEW — STEP11-B10 B10-C02 mencatat "M13
// Provider Catalogue mutation is Superadmin-only semantically, but exact
// mutation routes are not evidenced" — RLS `ai_providers_write_superadmin`
// (0015) sudah mendukung penuh sejak migration ditulis, jadi diimplementasi
// di sini (bukan dibiarkan tidak terjangkau HTTP). Otorisasi lewat RLS —
// R-02.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createAiProviderSchema } from "@/lib/validation/ai-providers";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("ai_providers")
    .select("*", { count: "exact" })
    .order("display_name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAiProviderSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("ai_providers").insert(body).select().single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
