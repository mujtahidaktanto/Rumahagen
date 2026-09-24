// app/api/courses/[id]/submit-review/route.ts
// ADD-NEW — POST ajukan kursus draf untuk terbit ("minta terbit", migration 0136): draft -> pending_review. Pemilik atau staf. Syarat (ditegakkan
// database): kursus punya minimal 1 pelajaran dan semua kuisnya siap. Selama ditinjau isi kursus terkunci bagi non-staf. Pelanggaran dikembalikan
// sebagai 409 (syarat belum terpenuhi) atau 403 (bukan pemilik).

import { withApiHandler } from "@/lib/api/handler";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .update({ status: "pending_review" })
    .eq("id", ctx.params.id)
    .select("id, title, status, submitted_for_review_at")
    .maybeSingle();

  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
