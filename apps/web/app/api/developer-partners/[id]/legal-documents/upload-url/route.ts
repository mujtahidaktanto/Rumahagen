// app/api/developer-partners/[id]/legal-documents/upload-url/route.ts
// POST /developer-partners/{id}/legal-documents/upload-url { file_name, content_type, size_bytes? } -- signed upload URL untuk berkas legalitas (migration 0172,
// bucket PRIVAT `developer-legal-docs`, PDF/JPEG/PNG 20 MB). TIDAK ADA policy storage.objects di proyek ini (pola konsisten lib/storage/project-files.ts) --
// otorisasi diperiksa eksplisit di sini (pemilik akun atau staf), bukan lewat RLS tabel developer_legal_documents yang baru berlaku SETELAH baris didaftarkan.

import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { MAX_LEGAL_DOC_BYTES, createDeveloperLegalDocUpload } from "@/lib/storage/developer-legal-docs";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  file_name: z.string().trim().min(1).max(255),
  content_type: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  size_bytes: z.number().int().positive().max(MAX_LEGAL_DOC_BYTES).optional(),
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, bodySchema);
  const supabase = await createClient();

  const { data: partner, error } = await supabase.from("developer_partners").select("id, user_id").eq("id", ctx.params.id).maybeSingle<{ id: string; user_id: string | null }>();
  if (error) throw error;
  if (!partner) throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan.");

  const { data: allowed, error: permError } = await supabase.rpc("has_permission", { p_action_code: "m06.developer_partner.update_own_profile", p_owner_id: partner.user_id });
  if (permError) throw permError;
  if (!allowed) {
    const { data: isStaff, error: staffError } = await supabase.rpc("has_permission", { p_action_code: "m06.developer_partner.manage" });
    if (staffError) throw staffError;
    if (!isStaff) throw new ApiError("FORBIDDEN", "Anda tidak berhak mengunggah berkas legalitas untuk perusahaan ini.");
  }

  return { data: { ...(await createDeveloperLegalDocUpload(partner.id, body.file_name)), method: "PUT", content_type: body.content_type }, status: 201 };
});
