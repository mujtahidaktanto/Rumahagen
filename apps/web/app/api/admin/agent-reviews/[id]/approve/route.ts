// app/api/admin/agent-reviews/[id]/approve/route.ts
// API-019 PUT /admin/agent-reviews/{id}/approve — Moderation/exception
// action (post-publication, BUKAN gate publikasi normal — Gate PRE-00-D
// §13-14). RLS agent_reviews_moderate (m02.review.moderate, Admin/
// Superadmin) yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_reviews")
    .update({ status: "approved", moderated_by: ctx.userId, moderated_at: new Date().toISOString() })
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
