// app/api/commercial/orders/route.ts
// API-178 POST /commercial/orders — Authenticated buyer/agent. `status`/
// `confirmed_at` selalu dipaksa 'pending'/NULL oleh trigger DB (0079) apa
// pun yang dikirim — order_number + commercial_snapshot dibangun server-
// side dari addon yang direferensikan (immutable purchase terms, STEP11-B7
// §9), TIDAK dari body klien.

import crypto from "node:crypto";
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createCommercialOrderSchema } from "@/lib/validation/commercial-orders";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat order.");
  }

  const body = await validateJsonBody(ctx.request, createCommercialOrderSchema);
  const supabase = await createClient();

  const { data: addon, error: addonError } = await supabase
    .from("addons")
    .select("*")
    .eq("id", body.addon_id)
    .maybeSingle();

  if (addonError) {
    throw addonError;
  }
  if (!addon) {
    throw new ApiError("NOT_FOUND", "Addon tidak ditemukan atau tidak aktif.");
  }

  const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const { data, error } = await supabase
    .from("commercial_orders")
    .insert({
      order_number: orderNumber,
      user_id: ctx.userId,
      organization_id: body.organization_id ?? null,
      addon_id: body.addon_id,
      promotion_id: body.promotion_id ?? null,
      amount: body.amount,
      currency: body.currency ?? "IDR",
      status: "pending",
      commercial_snapshot: { addon },
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
