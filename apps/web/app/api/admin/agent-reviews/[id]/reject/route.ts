// app/api/admin/agent-reviews/[id]/reject/route.ts
// API-020 PUT /admin/agent-reviews/{id}/reject — Moderation/exception action
// (post-publication). RLS agent_reviews_moderate yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { rejectAgentReviewSchema } from "@/lib/validation/agent-profiles";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, rejectAgentReviewSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_reviews")
    .update({
      status: "rejected",
      moderated_by: ctx.userId,
      moderated_at: new Date().toISOString(),
      comment: body.reason ?? undefined,
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Review tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
