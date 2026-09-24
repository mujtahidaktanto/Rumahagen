// app/api/developer-projects/[id]/uploads/route.ts
// POST /developer-projects/{id}/uploads { kind: "media"|"marketing_kit", file_name, content_type, size_bytes? } — meminta signed upload URL (migration 0147).
// Alur: (1) panggil endpoint ini, (2) klien PUT file ke `upload_url` dengan header Content-Type yang sama, (3) daftarkan lewat POST /developer-projects/{id}/media
// (`url` = file_url) atau POST /developer-projects/{id}/marketing-kit (`file_url` = file_url). Kepemilikan proyek diperiksa lewat sesi pengguna: pemilik perusahaan
// (izin m06.developer_project.manage / m06.marketing_kit.create atas pemilik proyek) atau staf. Batas ukuran dan tipe file ditegakkan storage.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { createProjectUploadSchema } from "@/lib/validation/project-uploads";
import {
  MARKETING_KIT_BUCKET,
  MAX_KIT_BYTES,
  MAX_MEDIA_BYTES,
  MEDIA_CONTENT_TYPES,
  PROJECT_MEDIA_BUCKET,
  createUploadTarget,
  kitRef,
  mediaPublicUrl,
  projectFilePath,
} from "@/lib/storage/project-files";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengunggah file proyek.");
  }
  const body = await validateJsonBody(ctx.request, createProjectUploadSchema);
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase.from("developer_projects").select("id, developer_id").eq("id", ctx.params.id).maybeSingle();
  if (projectError) {
    throw projectError;
  }
  if (!project) {
    throw new ApiError("NOT_FOUND", "Proyek tidak ditemukan atau Anda tidak punya akses.");
  }
  const { data: partner, error: partnerError } = await supabase.from("developer_partners").select("user_id").eq("id", project.developer_id).maybeSingle();
  if (partnerError) {
    throw partnerError;
  }
  const action = body.kind === "media" ? "m06.developer_project.manage" : "m06.marketing_kit.create";
  const { data: allowed, error: permError } = await supabase.rpc("has_permission", { p_action_code: action, p_owner_id: partner?.user_id ?? null });
  if (permError) {
    throw permError;
  }
  if (!allowed) {
    throw new ApiError("FORBIDDEN", "Anda tidak berhak mengunggah file untuk proyek ini.");
  }

  const bucket = body.kind === "media" ? PROJECT_MEDIA_BUCKET : MARKETING_KIT_BUCKET;
  const path = projectFilePath(project.id, body.file_name);
  const target = await createUploadTarget(bucket, path);

  return {
    data: {
      bucket,
      path,
      upload_url: target.signedUrl,
      token: target.token,
      method: "PUT",
      content_type: body.content_type,
      max_bytes: body.kind === "media" ? MAX_MEDIA_BYTES : MAX_KIT_BYTES,
      // Nilai yang didaftarkan setelah unggah selesai:
      file_url: body.kind === "media" ? mediaPublicUrl(path) : kitRef(path),
      media_type: body.kind === "media" ? MEDIA_CONTENT_TYPES[body.content_type as keyof typeof MEDIA_CONTENT_TYPES] : undefined,
    },
    status: 201,
  };
});
