// app/api/developer-partners/[id]/route.ts
// GET satu partner, PUT update, DELETE. Otorisasi lewat RLS
// developer_partners_select/developer_partners_manage (0033).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateDeveloperPartnerSchema } from "@/lib/validation/developer-partners";
import { ApiError } from "@/lib/api/errors";
import { isOwnDeveloperMediaUrl, removeDeveloperMediaByUrl } from "@/lib/storage/developer-media";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateDeveloperPartnerSchema);
  const supabase = await createClient();

  // Logo: hasil unggahan ke folder developer ini (jalur baru, migration 0172) ATAU tautan https bebas (jalur lama, staf masih boleh menempel URL manual
  // lewat form Admin) -- beda dari organizations.branding (0161) yang menutup total jalur URL bebas, karena di sini ada dua pengedit (mitra lewat unggah,
  // staf lewat form lama) dan belum semua form staf dipindah ke unggah.
  if (typeof body.company_logo === "string" && body.company_logo && !isOwnDeveloperMediaUrl(body.company_logo, ctx.params.id ?? "", "logo") && !/^https:\/\//.test(body.company_logo)) {
    throw new ApiError("VALIDATION_ERROR", "Logo harus tautan https atau diunggah lewat menu profil.");
  }

  const { data: before } = await supabase.from("developer_partners").select("company_logo").eq("id", ctx.params.id).maybeSingle<{ company_logo: string | null }>();

  const { data, error } = await supabase
    .from("developer_partners")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan atau Anda tidak punya akses.");
  }

  // Logo lama dihapus dari storage setelah diganti atau dilepas.
  if (before && "company_logo" in body && before.company_logo && before.company_logo !== data.company_logo) {
    await removeDeveloperMediaByUrl(before.company_logo);
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developer_partners")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Developer partner tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
