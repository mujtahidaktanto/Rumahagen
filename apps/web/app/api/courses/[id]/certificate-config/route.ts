// app/api/courses/[id]/certificate-config/route.ts
// GET/PUT /courses/{id}/certificate-config — konfigurasi sertifikat dan aturan kuis per kursus (migration 0150): penyelenggara (`organizer_type`: rumahagen |
// partner | instructor, menentukan aturan jeda kuis), template, penandatangan (nama, jabatan, tanda tangan PNG), maksimal 2 logo mitra, dan penimpaan batas
// percobaan/jeda kuis, serta `awards_title_definition_id` (migration 0155: title yang diberikan otomatis saat course selesai; dihilangkan = tidak diubah, null = lepas; title
// harus active dan punya scope aktif, kalau tidak 409). Kolom null = memakai nilai bawaan dari /admin/learning/settings. PUT menggantikan seluruh konfigurasi dan HANYA untuk staf (trigger database
// enforce_course_certificate_config_staff_only menolak non-staf dengan 403; file harus berada di folder courses/{id}/ dan sudah terunggah). File lama TIDAK
// dihapus: sertifikat yang sudah terbit menyimpan path-nya di snapshot dan PDF-nya harus tetap bisa dibuat ulang (sertifikat lama tidak berubah).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { requirePermission } from "@/lib/api/require-permission";
import { validateJsonBody } from "@/lib/api/validate";
import { courseCertificateConfigSchema } from "@/lib/validation/learning-settings";
import { certAssetExists, certAssetSignedUrl } from "@/lib/storage/certificate-assets";
import { createClient } from "@/lib/supabase/server";

const COLUMNS = "id, organizer_type, certificate_template, signer_name, signer_title, signer_signature_path, partner_logo_paths, quiz_max_attempts, quiz_cooldown_minutes, awards_title_definition_id";

async function withSignedUrls<T extends { signer_signature_path: string | null; partner_logo_paths: string[] }>(row: T) {
  return {
    ...row,
    signer_signature_url: await certAssetSignedUrl(row.signer_signature_path),
    partner_logo_urls: await Promise.all(row.partner_logo_paths.map((p) => certAssetSignedUrl(p))),
  };
}

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select(COLUMNS).eq("id", ctx.params.id).is("deleted_at", null).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data: await withSignedUrls(data) };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, courseCertificateConfigSchema);
  const supabase = await createClient();
  await requirePermission(supabase, "m04.course.publish", "Hanya staf yang boleh mengatur konfigurasi sertifikat dan aturan kuis.");

  const courseId = ctx.params.id;
  const prefix = `courses/${courseId}/`;
  const paths = [...body.partner_logo_paths, ...(body.signer_signature_path ? [body.signer_signature_path] : [])];
  if (paths.some((p) => !p.startsWith(prefix))) {
    throw new ApiError("VALIDATION_ERROR", "Logo dan tanda tangan harus diunggah lewat endpoint upload-url kursus ini.");
  }
  if (new Set(body.partner_logo_paths).size !== body.partner_logo_paths.length) {
    throw new ApiError("VALIDATION_ERROR", "Logo mitra tidak boleh duplikat.");
  }

  const { data: before, error: beforeError } = await supabase.from("courses").select(COLUMNS).eq("id", courseId).is("deleted_at", null).maybeSingle();
  if (beforeError) {
    throw beforeError;
  }
  if (!before) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }
  const previous = new Set<string>([...before.partner_logo_paths, ...(before.signer_signature_path ? [before.signer_signature_path] : [])]);
  for (const p of paths) {
    if (!previous.has(p) && !(await certAssetExists(p))) {
      throw new ApiError("VALIDATION_ERROR", "Salah satu file belum diunggah. Unggah dulu lewat upload-url.");
    }
  }

  const { data, error } = await supabase.from("courses").update(body).eq("id", courseId).select(COLUMNS).maybeSingle();
  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Course tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: await withSignedUrls(data) };
});
