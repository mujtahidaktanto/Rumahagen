// app/api/organizations/[id]/branding/upload-url/route.ts
// POST /organizations/{id}/branding/upload-url { content_type, kind: "logo" | "banner" } — signed upload URL untuk logo/banner organisasi (migration 0161, bucket publik `organization-media`, WebP/JPEG maks 3 MB).
// Hanya yang berhak mengubah branding (RLS organizations_manage: pembuat/leader atau staf) dan organisasi berstatus active. Setelah PUT berkas, pasang lewat PUT /organizations/{id}/branding { logo_url | banner_url }.

import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { createOrganizationMediaUpload } from "@/lib/storage/organization-media";
import { imageUploadUrlSchema } from "@/lib/storage/public-images";
import { createClient } from "@/lib/supabase/server";

const bodySchema = imageUploadUrlSchema.extend({ kind: z.enum(["logo", "banner"]) });

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, bodySchema);
  const supabase = await createClient();
  const { data: org, error } = await supabase.from("organizations").select("id, status, created_by").eq("id", ctx.params.id).maybeSingle<{ id: string; status: string; created_by: string }>();
  if (error) throw error;
  const { data: isLeader } = await supabase.rpc("is_org_leader", { p_organization_id: ctx.params.id });
  if (!org || (org.created_by !== ctx.userId && !isLeader)) throw new ApiError("FORBIDDEN", "Organisasi tidak ditemukan atau Anda tidak berhak mengubah brandingnya.");
  if (org.status !== "active") throw new ApiError("CONFLICT", "Branding hanya bisa diubah pada organisasi yang aktif.");
  return { data: { ...(await createOrganizationMediaUpload(org.id, body.kind, body.content_type)), method: "PUT" }, status: 201 };
});
