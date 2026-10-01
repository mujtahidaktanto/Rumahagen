// app/api/developer-partners/[id]/media-upload-url/route.ts
// POST /developer-partners/{id}/media-upload-url { kind: "logo"|"history_logo", content_type } -- signed upload URL untuk logo perusahaan atau logo riwayat
// perumahan (migration 0172, bucket publik `developer-media`, WebP/JPEG 3 MB). Otorisasi: pemilik akun (m06.developer_partner.update_own_profile, own) atau
// staf (m06.developer_partner.manage, all) -- sama seperti pengecekan PUT /organizations/{id}/branding/upload-url (0161), tapi lewat has_permission langsung
// (bukan RPC is_org_leader) karena developer_partners RLS sudah berbasis has_permission, bukan kepemimpinan organisasi.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { developerMediaUploadSchema } from "@/lib/validation/developer-partners";
import { createDeveloperMediaUpload } from "@/lib/storage/developer-media";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, developerMediaUploadSchema);
  const supabase = await createClient();

  const { data: partner, error } = await supabase.from("developer_partners").select("id, user_id").eq("id", ctx.params.id).maybeSingle<{ id: string; user_id: string | null }>();
  if (error) throw error;
  if (!partner) throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan.");

  const { data: allowed, error: permError } = await supabase.rpc("has_permission", { p_action_code: "m06.developer_partner.update_own_profile", p_owner_id: partner.user_id });
  if (permError) throw permError;
  if (!allowed) {
    const { data: isStaff, error: staffError } = await supabase.rpc("has_permission", { p_action_code: "m06.developer_partner.manage" });
    if (staffError) throw staffError;
    if (!isStaff) throw new ApiError("FORBIDDEN", "Anda tidak berhak mengunggah media untuk perusahaan ini.");
  }

  return { data: { ...(await createDeveloperMediaUpload(partner.id, body.kind, body.content_type)), method: "PUT" }, status: 201 };
});
