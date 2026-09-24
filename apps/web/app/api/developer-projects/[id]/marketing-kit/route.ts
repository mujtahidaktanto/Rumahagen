// app/api/developer-projects/[id]/marketing-kit/route.ts
// GET (list kit milik satu project), POST (upload/create). Otorisasi lewat
// RLS marketing_kit_select/marketing_kit_manage (0035) — Developer Partner
// pemilik project=OWN, Superadmin/Admin/Manager=ALL, Agent hanya view/download
// (tidak lolos WITH CHECK manage saat POST).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createMarketingKitSchema } from "@/lib/validation/marketing-kit";
import { ApiError } from "@/lib/api/errors";
import { STORAGE_REF_PREFIX, isOwnKitRef, kitObjectExists, kitPathOf, withKitDownloadUrls } from "@/lib/storage/project-files";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_kit")
    .select("*")
    .eq("project_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  // download_url: signed URL 1 jam untuk file yang diunggah ke storage (URL luar dikembalikan apa adanya).
  return { data: await withKitDownloadUrls(data ?? []) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createMarketingKitSchema);
  const supabase = await createClient();

  if (body.file_url.startsWith(STORAGE_REF_PREFIX)) {
    const path = kitPathOf(body.file_url);
    if (!isOwnKitRef(body.file_url, ctx.params.id ?? "") || !path) {
      throw new ApiError("VALIDATION_ERROR", "Referensi file bukan milik proyek ini.");
    }
    if (!(await kitObjectExists(path))) {
      throw new ApiError("VALIDATION_ERROR", "File belum diunggah ke storage; selesaikan unggah lebih dulu.");
    }
  }

  const { data, error } = await supabase
    .from("marketing_kit")
    .insert({ ...body, project_id: ctx.params.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
