// app/api/admin/commercial/addons/[id]/route.ts
// ADD-NEW — GET satu addon dan PUT ubah. Tidak ada DELETE: addon dinonaktifkan lewat PATCH /status (addon yang punya pesanan tidak bisa
// dihapus, migration 0132). Addon yang sudah punya pesanan: kode, masa berlaku, dan kapasitas terkunci (harga/nama/promosi/status tetap bisa diubah;
// harga baru hanya berlaku untuk pesanan baru).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateAddonSchema } from "@/lib/validation/commercial-addons";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("addons").select("*").eq("id", ctx.params.id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Addon tidak ditemukan atau Anda tidak punya akses.");
  }
  const { count } = await supabase
    .from("commercial_orders")
    .select("id", { count: "exact", head: true })
    .eq("addon_id", ctx.params.id);
  return { data: { ...data, order_count: count ?? 0, terms_locked: (count ?? 0) > 0 } };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateAddonSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addons")
    .update({
      ...body,
      // PUT = form penuh: field yang tidak dikirim dikosongkan (mis. validity_days saat tipe 'unlimited').
      price: body.price ?? null,
      validity_days: body.validity_days ?? null,
      capacity_type: body.capacity_type ?? null,
      capacity_value: body.capacity_value ?? null,
      promotion_id: body.promotion_id ?? null,
      additional_capacities: body.additional_capacities ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Kode addon ini sudah dipakai.");
    }
    if (error.code === "23514" && error.message?.includes("dikunci")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Addon tidak ditemukan atau Anda tidak punya akses.");
  }
  return { data };
});
