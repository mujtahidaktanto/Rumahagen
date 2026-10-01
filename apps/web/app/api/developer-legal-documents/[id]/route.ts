// app/api/developer-legal-documents/[id]/route.ts
// DELETE satu berkas legalitas. Otorisasi lewat RLS developer_legal_documents_manage (migration 0172).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { removeDeveloperLegalDocObject } from "@/lib/storage/developer-legal-docs";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_legal_documents")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("NOT_FOUND", "Berkas legalitas tidak ditemukan atau Anda tidak punya akses.");
  }

  await removeDeveloperLegalDocObject(data.file_url);
  return { data: { id: ctx.params.id, deleted: true } };
});
