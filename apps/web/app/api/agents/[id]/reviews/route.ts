// app/api/agents/[id]/reviews/route.ts
// API-016 GET /agents/{id}/reviews (public), API-017 POST /agents/{id}/reviews
// (submission, auto-approved — STEP11-B1 §6/Gate PRE-00-D §11/§13-14).
// `buyer_id` = ctx.userId kalau pengulas BUKAN agent yang direview sendiri
// (Buyer=OWN), NULL kalau agent me-review dirinya sendiri (Agent=OWN
// self-review, dievidence eksplisit di komentar migration 0030) — RLS
// agent_reviews_insert memakai COALESCE(buyer_id, agent_id) untuk
// has_permission(), jadi salah satu kolom itu HARUS berisi ctx.userId agar
// lolos scope 'own'.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createAgentReviewSchema } from "@/lib/validation/agent-profiles";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("agent_reviews")
    .select("*", { count: "exact" })
    .eq("agent_id", ctx.params.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengirim review.");
  }

  const body = await validateJsonBody(ctx.request, createAgentReviewSchema);
  const supabase = await createClient();

  const isSelfReview = ctx.userId === ctx.params.id;

  const { data, error } = await supabase
    .from("agent_reviews")
    .insert({
      agent_id: ctx.params.id,
      buyer_id: isSelfReview ? null : ctx.userId,
      reviewer_name: body.reviewer_name ?? null,
      listing_lead_id: body.listing_lead_id ?? null,
      rating: body.rating,
      comment: body.comment ?? null,
      status: "approved",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
