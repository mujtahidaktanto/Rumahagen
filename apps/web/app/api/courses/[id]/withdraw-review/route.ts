// app/api/courses/[id]/withdraw-review/route.ts
// ADD-NEW — POST tarik kembali pengajuan terbit oleh pemilik (migration 0136): pending_review -> draft. Setelah ditarik kursus bisa diedit lagi.
// Menolak pengajuan oleh staf memakai POST /courses/{id}/review (wajib catatan).

import { withApiHandler } from "@/lib/api/handler";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase.from("courses").select("status").eq("id", ctx.params.id).maybeSingle();
  if (currentError) {
    throw currentError;
  }
  if (!current) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  if (current.status !== "pending_review") {
    throw new ApiError("CONFLICT", "Hanya kursus yang sedang menunggu tinjauan yang bisa ditarik kembali.");
  }

  const { data, error } = await supabase
    .from("courses")
    .update({ status: "draft" })
    .eq("id", ctx.params.id)
    .select("id, title, status")
    .maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
