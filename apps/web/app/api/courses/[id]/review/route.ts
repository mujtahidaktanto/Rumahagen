// app/api/courses/[id]/review/route.ts
// ADD-NEW — POST keputusan tinjauan kursus oleh staf (migration 0136, izin m04.course.publish): approve = pending_review -> published;
// reject = pending_review -> draft dengan catatan wajib. Pemilik mendapat notifikasi. Non-staf ditolak database (403). Kuis yang belum siap
// menggagalkan persetujuan (409, migration 0135).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { courseReviewDecisionSchema } from "@/lib/validation/courses";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, courseReviewDecisionSchema);
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase.from("courses").select("status").eq("id", ctx.params.id).maybeSingle();
  if (currentError) {
    throw currentError;
  }
  if (!current) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  if (current.status !== "pending_review") {
    throw new ApiError("CONFLICT", "Kursus ini tidak sedang menunggu tinjauan.");
  }

  const update = body.decision === "approve" ? { status: "published", review_note: body.note ?? null } : { status: "draft", review_note: body.note };
  const { data, error } = await supabase
    .from("courses")
    .update(update)
    .eq("id", ctx.params.id)
    .select("id, title, status, review_note, reviewed_by, reviewed_at")
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
