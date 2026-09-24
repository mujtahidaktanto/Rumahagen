// app/api/admin/commercial/plans/route.ts
// GET daftar paket langganan (semua status untuk staf) dan POST buat paket. Otorisasi lewat RLS subscription_plans_manage/select
// (m14.commercial_administration.configure). Non-staf hanya melihat paket aktif dan ditolak saat menulis.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody, validateSearchParams } from "@/lib/api/validate";
import { createPlanSchema, listPlansQuerySchema } from "@/lib/validation/commercial-plans";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const filters = validateSearchParams(new URL(ctx.request.url).searchParams, listPlansQuerySchema);
  const supabase = await createClient();
  let query = supabase.from("subscription_plans").select("*").order("duration_months", { ascending: true });
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const body = await validateJsonBody(ctx.request, createPlanSchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({ ...body, status: body.status ?? "draft" })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode paket ini sudah dipakai.");
    }
    if (error.code === "23514") {
      throw new ApiError("VALIDATION_ERROR", "Paket aktif wajib punya minimal satu harga lebih dari 0.");
    }
    throw error;
  }
  return { data, status: 201 };
});
