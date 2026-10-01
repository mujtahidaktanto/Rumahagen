// app/api/developer-partners/[id]/legal-documents/route.ts
// GET (daftar berkas legalitas milik satu developer), POST (daftarkan berkas setelah diunggah). Otorisasi SEPENUHNYA lewat RLS developer_legal_documents_manage
// (migration 0172, FOR ALL -- berkas ini tidak pernah publik, pemilik akun own + staf all) -- pola sama seperti app/api/developer-projects/[id]/marketing-kit/route.ts.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createDeveloperLegalDocumentSchema } from "@/lib/validation/developer-partners";
import { ApiError } from "@/lib/api/errors";
import { developerLegalDocExists, developerLegalDocPathOf, isOwnDeveloperLegalDocRef, withDeveloperLegalDocDownloadUrls } from "@/lib/storage/developer-legal-docs";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_legal_documents")
    .select("*")
    .eq("developer_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // download_url: signed URL 1 jam -- RLS sudah membatasi baris yang terlihat ke pemilik akun/staf saja.
  return { data: await withDeveloperLegalDocDownloadUrls(data ?? []) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createDeveloperLegalDocumentSchema);
  const supabase = await createClient();

  const path = developerLegalDocPathOf(body.file_url);
  if (!path || !isOwnDeveloperLegalDocRef(body.file_url, ctx.params.id ?? "")) {
    throw new ApiError("VALIDATION_ERROR", "Referensi berkas bukan milik perusahaan ini.");
  }
  if (!(await developerLegalDocExists(path))) {
    throw new ApiError("VALIDATION_ERROR", "Berkas belum diunggah ke storage; selesaikan unggah lebih dulu.");
  }

  const { data, error } = await supabase
    .from("developer_legal_documents")
    .insert({ ...body, developer_id: ctx.params.id, uploaded_by: ctx.userId })
    .select()
    .single();

  if (error) throw error;

  return { data, status: 201 };
});
