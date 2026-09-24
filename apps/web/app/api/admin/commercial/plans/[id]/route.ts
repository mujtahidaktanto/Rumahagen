// app/api/admin/commercial/plans/[id]/route.ts
// GET satu paket dan PUT ubah. Tidak ada DELETE: paket dinonaktifkan lewat PATCH /status (paket yang sudah terjual tidak bisa dihapus; kode dan durasi
// terkunci setelah terjual, migration 0142). Harga baru hanya berlaku untuk order baru.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updatePlanSchema } from "@/lib/validation/commercial-plans";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", ctx.params.id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Paket tidak ditemukan atau Anda tidak punya akses.");
  }
  const { count } = await supabase.from("commercial_orders").select("id", { count: "exact", head: true }).eq("subscription_plan_id", ctx.params.id);
  return { data: { ...data, order_count: count ?? 0, terms_locked: (count ?? 0) > 0 } };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updatePlanSchema);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .update({
      ...body,
      // PUT = form penuh: harga/deskripsi yang tidak dikirim dikosongkan.
      description: body.description ?? null,
      price_personal: body.price_personal ?? null,
      price_organization: body.price_organization ?? null,
      promotion_id: body.promotion_id ?? null,
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode paket ini sudah dipakai.");
    }
    if (error.code === "23514") {
      throw new ApiError("CONFLICT", error.message.replace(/^[a-z_]+: /, ""));
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Paket tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
