// app/api/marketing-kit/[id]/route.ts
// GET satu file kit, PUT update, DELETE. Otorisasi lewat RLS
// marketing_kit_select/marketing_kit_manage (0035).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateMarketingKitSchema } from "@/lib/validation/marketing-kit";
import { ApiError } from "@/lib/api/errors";
import { STORAGE_REF_PREFIX, isOwnKitRef, kitObjectExists, kitPathOf, removeKitObject, withKitDownloadUrls } from "@/lib/storage/project-files";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("marketing_kit").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan.");
  }

  const [withUrl] = await withKitDownloadUrls([data]);
  return { data: withUrl };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateMarketingKitSchema);
  const supabase = await createClient();

  if (body.file_url?.startsWith(STORAGE_REF_PREFIX)) {
    const { data: current } = await supabase.from("marketing_kit").select("project_id").eq("id", ctx.params.id).maybeSingle();
    const path = kitPathOf(body.file_url);
    if (!current || !path || !isOwnKitRef(body.file_url, current.project_id)) {
      throw new ApiError("VALIDATION_ERROR", "Referensi file bukan milik proyek ini.");
    }
    if (!(await kitObjectExists(path))) {
      throw new ApiError("VALIDATION_ERROR", "File belum diunggah ke storage; selesaikan unggah lebih dulu.");
    }
  }

  const { data, error } = await supabase
    .from("marketing_kit")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_kit")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Marketing kit tidak ditemukan atau Anda tidak punya akses.");
  }

  // Hapus juga file di storage (bila kit berasal dari unggahan) setelah baris berhasil dihapus lewat RLS.
  await removeKitObject(data.file_url);
  return { data: { id: ctx.params.id, deleted: true } };
});
