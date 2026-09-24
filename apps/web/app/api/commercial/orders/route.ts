// app/api/commercial/orders/route.ts
// API-178 POST /commercial/orders — Authenticated buyer/agent. `status`/
// `confirmed_at` selalu dipaksa 'pending'/NULL oleh trigger DB (0079). HARGA
// (amount, currency, promotion_id) dan commercial_snapshot dihitung server oleh
// trigger trg_price_commercial_order (0131) dari addons.price; nilai placeholder
// di bawah hanya memenuhi NOT NULL dan SELALU ditimpa. Klien tidak mengirim harga.

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
  if (addon.status !== "active" || !(Number(addon.price) > 0)) {
    throw new ApiError("CONFLICT", "Addon ini belum bisa dibeli (tidak aktif atau belum punya harga).");
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
      amount: 0, // placeholder, ditimpa trigger dengan harga server
      currency: "IDR", // placeholder, ditimpa trigger
      status: "pending",
      commercial_snapshot: {}, // placeholder, ditimpa trigger dengan snapshot server
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
